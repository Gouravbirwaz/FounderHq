require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('./routes/rooms');
const { authenticateSocket } = require('./middleware/auth');
const Room = require('./models/Room');
const Participant = require('./models/Participant');
const ActivityLog = require('./models/ActivityLog');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/rooms', roomRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/huddle_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Signaling Server (Socket.io)
io.use(authenticateSocket);

io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);

    socket.on('join-room', async ({ roomId }) => {
        socket.join(roomId);

        // Track participant
        await Participant.findOneAndUpdate(
            { roomId, userId: socket.user.id },
            { socketId: socket.id },
            { upsert: true }
        );

        // Log activity
        await new ActivityLog({ roomId, userId: socket.user.id, action: 'join' }).save();

        // Broadcast to others in room
        socket.to(roomId).emit('user-joined', { userId: socket.user.id, socketId: socket.id });

        console.log(`User ${socket.user.id} joined room ${roomId}`);
    });

    socket.on('offer', ({ to, offer }) => {
        socket.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
        socket.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('leave-room', async ({ roomId }) => {
        await handleLeave(socket, roomId);
    });

    socket.on('disconnect', async () => {
        // Find rooms user was in and cleanup
        const participants = await Participant.find({ socketId: socket.id });
        for (const p of participants) {
            await handleLeave(socket, p.roomId);
        }
        console.log('User disconnected:', socket.user.id);
    });
});

async function handleLeave(socket, roomId) {
    socket.leave(roomId);
    await Participant.deleteOne({ socketId: socket.id, roomId });
    await new ActivityLog({ roomId, userId: socket.user.id, action: 'leave' }).save();
    socket.to(roomId).emit('user-left', { userId: socket.user.id, socketId: socket.id });
}

// Room Cleanup Logic (runs every 10 minutes)
setInterval(async () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const inactiveRooms = await Room.find({
        status: 'active',
        lastActivityAt: { $lt: thirtyMinsAgo }
    });

    for (const room of inactiveRooms) {
        room.status = 'ended';
        await room.save();
        console.log(`Auto-ended inactive room: ${room.roomId}`);
    }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Huddle Service running on port ${PORT}`);
});
