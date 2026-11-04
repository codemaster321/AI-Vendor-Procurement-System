import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import { applyDnsServers } from './dns.js';

const connectDB = async () => {
    try {
        applyDnsServers();
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Vendor email used to be globally unique; it is now unique per owner.
        // syncIndexes drops the old `email_1` index and builds the new one.
        await Vendor.syncIndexes();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // A serverless function must not kill its runtime; locally, fail fast.
        if (!process.env.VERCEL) process.exit(1);
    }
};

export default connectDB;
