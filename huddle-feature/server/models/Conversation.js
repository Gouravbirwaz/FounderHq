const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: String, required: true }], // Array of user IDs
    lastMessage: {
        text: String,
        senderId: String,
        timestamp: Date
    },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure we don't have duplicate conversations for the same pair of people
// This index helps find conversations between exact sets of participants
ConversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
