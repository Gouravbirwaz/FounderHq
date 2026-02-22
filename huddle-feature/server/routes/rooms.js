const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create a room
router.post('/create', authenticate, async (req, res) => {
    try {
        const { type } = req.body;
        const roomId = uuidv4();
        const room = new Room({
            roomId,
            createdBy: req.user.id,
            type,
            participants: []
        });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get room details
router.get('/:id', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.id });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Join a room (metadata update)
router.post('/:id/join', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.id });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.status === 'ended') return res.status(400).json({ message: 'Room has ended' });

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
router.post('/:id/end', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.id });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.createdBy !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        room.status = 'ended';
        await room.save();
        res.json({ message: 'Room ended' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
