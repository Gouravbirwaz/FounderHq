const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    type: { type: String, enum: ['voice', 'video'], required: true },
    participants: [{ type: String }],
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HuddleRoom', roomSchema);
