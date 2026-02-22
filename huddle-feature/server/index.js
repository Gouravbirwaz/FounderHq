require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
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
app.use('/messages', messageRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/huddle_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Signaling Server (Socket.io)
io.use(authenticateSocket);

const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);
    userSockets.set(socket.user.id, socket.id);

    socket.on('send-message', async ({ conversationId, receiverId, text }) => {
        try {
            const Message = require('./models/Message');
            const Conversation = require('./models/Conversation');

            const message = new Message({
                conversationId,
                senderId: socket.user.id,
                receiverId,
                text
            });
            await message.save();

            // Update conversation preview
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: {
                    text,
                    senderId: socket.user.id,
                    timestamp: new Date()
                },
                updatedAt: new Date()
            });

            // Emit to receiver if online
            const receiverSocketId = userSockets.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive-message', message);
            }

            // Emit back to sender (for multi-device sync or just confirmation)
            socket.emit('message-sent', message);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });

    socket.on('join-room', async ({ roomCode }) => {
        socket.join(roomCode);
        console.log(`User ${socket.user.id} joining room ${roomCode}`);

        // Track participant
        await Participant.findOneAndUpdate(
            { roomCode, userId: socket.user.id },
            { socketId: socket.id },
            { upsert: true }
        );

        // Update room participants list if not already there
        await Room.findOneAndUpdate(
            { roomCode },
            { $addToSet: { participants: socket.user.id }, lastActivityAt: Date.now() }
        );

        // Log activity
        await new ActivityLog({ roomCode, userId: socket.user.id, action: 'join' }).save();

        // Broadcast to others in room
        socket.to(roomCode).emit('user-joined', { userId: socket.user.id, socketId: socket.id });

        console.log(`User ${socket.user.id} joined room ${roomCode}`);
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

    socket.on('leave-room', async ({ roomCode }) => {
        await handleLeave(socket, roomCode);
    });

    socket.on('disconnect', async () => {
        // Find rooms user was in and cleanup
        const participants = await Participant.find({ socketId: socket.id });
        for (const p of participants) {
            await handleLeave(socket, p.roomCode);
        }
        console.log('User disconnected:', socket.user.id);
        userSockets.delete(socket.user.id);
    });
});

async function handleLeave(socket, roomCode) {
    socket.leave(roomCode);
    await Participant.deleteOne({ socketId: socket.id, roomCode });

    // Log activity
    await new ActivityLog({ roomCode, userId: socket.user.id, action: 'leave' }).save();

    // Notify others
    socket.to(roomCode).emit('user-left', { userId: socket.user.id, socketId: socket.id });

    // Check if room is empty
    const remainingCount = await Participant.countDocuments({ roomCode });
    if (remainingCount === 0) {
        await Room.findOneAndUpdate({ roomCode }, { active: false });
        console.log(`Room ${roomCode} marked inactive (all participants left)`);
    } else {
        // Still has participants, maybe remove user from room.participants array?
        // Actually, the requirement says "Participants list" should show active ones.
        // Let's remove from Room.participants too.
        await Room.findOneAndUpdate(
            { roomCode },
            { $pull: { participants: socket.user.id }, lastActivityAt: Date.now() }
        );
    }
}

// Room Cleanup Logic (runs every 10 minutes)
setInterval(async () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const inactiveRooms = await Room.find({
        active: true,
        lastActivityAt: { $lt: thirtyMinsAgo }
    });

    for (const room of inactiveRooms) {
        room.active = false;
        await room.save();
        console.log(`Auto-ended inactive room: ${room.roomCode}`);
    }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Huddle Service running on port ${PORT}`);
});
