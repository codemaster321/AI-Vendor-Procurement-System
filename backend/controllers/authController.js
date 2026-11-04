import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { serverError } from '../utils/http.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
    try {
        const { name, password, company } = req.body;
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password, company });
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            token
        });
    } catch (error) {
        serverError(res, error);
    }
};

export const login = async (req, res) => {
    try {
        const { password } = req.body;
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            token
        });
    } catch (error) {
        serverError(res, error);
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        serverError(res, error);
    }
};
