import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const getToken = (req, { allowQueryToken }) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return header.slice('Bearer '.length).trim();
    }
    // EventSource (SSE) cannot send headers, so those routes may pass ?token=
    if (allowQueryToken && typeof req.query.token === 'string') {
        return req.query.token;
    }
    return null;
};

const buildProtect = (options) => async (req, res, next) => {
    const token = getToken(req, options);
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user no longer exists' });
        }
        req.user = user;
        return next();
    } catch {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

/** Requires `Authorization: Bearer <token>`. */
export const protect = buildProtect({ allowQueryToken: false });

/** Same as protect, but also accepts `?token=` — only for SSE endpoints. */
export const protectSSE = buildProtect({ allowQueryToken: true });
