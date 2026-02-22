const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'founderhq-super-secret-key-2024';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.sub, ...payload };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        socket.user = { id: payload.sub, ...payload };
        next();
    } catch (err) {
        return next(new Error('Authentication error'));
    }
};

module.exports = { authenticate, authenticateSocket };
