const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const PYTHON_API_URL = 'http://localhost:8000/api/v1';

// Get all conversations for the current user
router.get('/conversations', authenticate, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        }).sort({ updatedAt: -1 }).lean();

        // Hydrate other participant info
        const authHeader = req.headers.authorization;
        const hydratedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherParticipantId = conv.participants.find(id => id !== req.user.id);
            if (!otherParticipantId) return conv;

            try {
                const response = await fetch(`${PYTHON_API_URL}/auth/${otherParticipantId}`, {
                    headers: { 'Authorization': authHeader }
                });
                if (response.ok) {
                    conv.otherParticipant = await response.json();
                }
            } catch (err) {
                console.error(`Failed to hydrate participant ${otherParticipantId}:`, err.message);
            }
            return conv;
        }));

        res.json(hydratedConversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages for a specific conversation
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.id
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start or get a conversation with another user
router.post('/conversations', authenticate, async (req, res) => {
    try {
        const { participantId } = req.body;
        if (!participantId) return res.status(400).json({ message: 'Participant ID is required' });

        // Check for existing 1-on-1 conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, participantId], $size: 2 }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user.id, participantId]
            });
            await conversation.save();
        }

        const result = conversation.toObject();
        try {
            const authHeader = req.headers.authorization;
            const response = await fetch(`${PYTHON_API_URL}/auth/${participantId}`, {
                headers: { 'Authorization': authHeader }
            });
            if (response.ok) {
                result.otherParticipant = await response.json();
            }
        } catch (err) {
            console.error(`Failed to hydrate participant ${participantId}:`, err.message);
        }

        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
