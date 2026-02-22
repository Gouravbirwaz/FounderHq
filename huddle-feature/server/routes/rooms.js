const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to generate 8-char room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create a room
router.post('/create', authenticate, async (req, res) => {
    try {
        const { type } = req.body;
        const roomCode = generateRoomCode();
        console.log(`Creating room: ${roomCode} for user: ${req.user.id}`);
        const room = new Room({
            roomCode,
            creatorId: req.user.id,
            type,
            participants: [req.user.id]
        });
        await room.save();
        console.log(`Room created successfully: ${roomCode}`);
        res.status(201).json(room);
    } catch (err) {
        console.error(`Error creating room: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Get room details
router.get('/:code', authenticate, async (req, res) => {
    try {
        console.log(`Looking up room with code: ${req.params.code}`);
        const room = await Room.findOne({ roomCode: req.params.code });
        if (!room) {
            console.log(`Room NOT found: ${req.params.code}`);
            return res.status(404).json({ message: 'Room not found' });
        }
        console.log(`Room found: ${req.params.code}`);
        res.json(room);
    } catch (err) {
        console.error(`Error looking up room: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Join a room (metadata update)
router.post('/:code/join', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ roomCode: req.params.code });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!room.active) return res.status(400).json({ message: 'Room is inactive' });

        if (!room.participants.includes(req.user.id)) {
            room.participants.push(req.user.id);
            room.lastActivityAt = Date.now();
            await room.save();
        }
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// End a room
router.post('/:code/end', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ roomCode: req.params.code });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.creatorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        room.active = false;
        await room.save();
        res.json({ message: 'Room ended' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
