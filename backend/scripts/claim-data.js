// One-time migration: records created before per-user ownership have no `owner`
// and are invisible in the app. This assigns them to an existing account.
//
//   npm run claim -- you@example.com
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import RFP from '../models/RFP.js';
import Proposal from '../models/Proposal.js';
import { applyDnsServers } from '../config/dns.js';

const email = process.argv[2]?.toLowerCase();
if (!email) {
    console.error('Usage: npm run claim -- you@example.com');
    process.exit(1);
}

try {
    applyDnsServers();
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email });
    if (!user) throw new Error(`No user with email ${email}. Sign up in the app first.`);

    const noOwner = { $or: [{ owner: { $exists: false } }, { owner: null }] };
    const [v, r, p] = await Promise.all([
        Vendor.updateMany(noOwner, { $set: { owner: user._id } }),
        RFP.updateMany(noOwner, { $set: { owner: user._id } }),
        Proposal.updateMany(noOwner, { $set: { owner: user._id } }),
    ]);
    await Vendor.syncIndexes();

    console.log(`Assigned to ${user.email}: ${v.modifiedCount} vendors, ${r.modifiedCount} RFPs, ${p.modifiedCount} proposals`);
    process.exit(0);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
