// Must be the first import: ES module imports are evaluated before the
// importing module's body, so env vars have to be loaded here.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import rfpRoutes from './routes/rfpRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import { protect } from './middleware/authMiddleware.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting — JSON bodies so the frontend can show `message`
const limiter = (max, message) =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max,
        message: { message },
        standardHeaders: true,
        legacyHeaders: false,
    });

// Brute-force protection on credential endpoints only
const authLimiter = limiter(20, 'Too many login attempts, please try again in a few minutes');
const apiLimiter = limiter(1000, 'Too many requests, please slow down');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/rfps', apiLimiter, protect, rfpRoutes);
app.use('/api/vendors', apiLimiter, protect, vendorRoutes);
// Proposal routes apply auth per-route (the SSE endpoint takes ?token=)
app.use('/api/proposals', apiLimiter, proposalRoutes);

app.get('/', (req, res) => {
    res.send('RFP Manager API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
