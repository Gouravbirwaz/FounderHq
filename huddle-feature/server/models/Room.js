const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true },
    creatorId: { type: String, required: true },
    type: { type: String, enum: ['voice', 'video'], required: true },
    participants: [{ type: String }],
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HuddleRoom', roomSchema);
