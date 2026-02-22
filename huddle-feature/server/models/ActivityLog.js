const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    roomCode: { type: String, required: true },
    userId: { type: String, required: true },
    action: { type: String, required: true }, // 'join', 'leave', 'create', 'end'
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HuddleActivityLog', logSchema);
