const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    socketId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HuddleParticipant', participantSchema);
