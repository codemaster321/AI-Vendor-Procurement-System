import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor.js';
import RFP from './models/RFP.js';
import Proposal from './models/Proposal.js';
import User from './models/User.js';
import { applyDnsServers } from './config/dns.js';

dotenv.config();

// Comprehensive pre-populated vendor database
const vendorDatabase = [
    // IT Equipment & Hardware
    {
        name: 'Dell Technologies',
        email: 'enterprise@dell.com',
        contactPerson: 'John Smith',
        phone: '+1-800-289-3355',
        category: 'IT Equipment'
    },
    {
        name: 'HP Enterprise',
        email: 'enterprise@hp.com',
        contactPerson: 'Sarah Johnson',
        phone: '+1-650-857-1501',
        category: 'IT Equipment'
    },
    {
        name: 'Lenovo Corporation',
        email: 'sales@lenovo.com',
        contactPerson: 'Michael Chen',
        phone: '+1-855-253-6686',
        category: 'IT Equipment'
    },
    {
        name: 'Apple Business',
        email: 'business@apple.com',
        contactPerson: 'Emily Rodriguez',
        phone: '+1-800-692-7753',
        category: 'IT Equipment'
    },
    {
        name: 'Microsoft Surface',
        email: 'surface@microsoft.com',
        contactPerson: 'David Park',
        phone: '+1-877-696-7786',
        category: 'IT Equipment'
    },
    {
        name: 'Cisco Systems',
        email: 'enterprise@cisco.com',
        contactPerson: 'Angela Martinez',
        phone: '+1-408-526-4000',
        category: 'IT Equipment'
    },

    // Office Supplies
    {
        name: 'Staples Business',
        email: 'business@staples.com',
        contactPerson: 'Robert White',
        phone: '+1-800-333-3330',
        category: 'Office Supplies'
    },
    {
        name: 'Office Depot',
        email: 'corporate@officedepot.com',
        contactPerson: 'Lisa Thompson',
        phone: '+1-800-463-3768',
        category: 'Office Supplies'
    },
    {
        name: 'Amazon Business',
        email: 'business@amazon.com',
        contactPerson: 'James Wilson',
        phone: '+1-888-281-3847',
        category: 'Office Supplies'
    },

    // Furniture
    {
        name: 'Herman Miller',
        email: 'sales@hermanmiller.com',
        contactPerson: 'Patricia Garcia',
        phone: '+1-888-443-4357',
        category: 'Furniture'
    },
    {
        name: 'Steelcase',
        email: 'corporate@steelcase.com',
        contactPerson: 'Christopher Lee',
        phone: '+1-888-783-3522',
        category: 'Furniture'
    },
    {
        name: 'IKEA Business',
        email: 'business@ikea.com',
        contactPerson: 'Maria Gonzalez',
        phone: '+1-888-888-4532',
        category: 'Furniture'
    },

    // Software & Cloud Services
    {
        name: 'Salesforce',
        email: 'sales@salesforce.com',
        contactPerson: 'Kevin Anderson',
        phone: '+1-800-667-6389',
        category: 'Software'
    },
    {
        name: 'Adobe Enterprise',
        email: 'enterprise@adobe.com',
        contactPerson: 'Jennifer Taylor',
        phone: '+1-800-833-6687',
        category: 'Software'
    },
    {
        name: 'AWS (Amazon Web Services)',
        email: 'sales@aws.amazon.com',
        contactPerson: 'Daniel Moore',
        phone: '+1-206-266-4064',
        category: 'Software'
    },

    // Telecommunications
    {
        name: 'Verizon Business',
        email: 'business@verizon.com',
        contactPerson: 'Michelle Clark',
        phone: '+1-800-922-0204',
        category: 'Telecommunications'
    },
    {
        name: 'AT&T Business',
        email: 'business@att.com',
        contactPerson: 'Thomas Martinez',
        phone: '+1-800-321-2000',
        category: 'Telecommunications'
    },

    // Printing & Imaging
    {
        name: 'Canon Business',
        email: 'business@canon.com',
        contactPerson: 'Susan Wright',
        phone: '+1-800-652-2666',
        category: 'Printing'
    },
    {
        name: 'Xerox Corporation',
        email: 'corporate@xerox.com',
        contactPerson: 'Richard Hall',
        phone: '+1-800-275-9376',
        category: 'Printing'
    },

    // Catering & Food Services
    {
        name: 'Sysco Corporate',
        email: 'corporate@sysco.com',
        contactPerson: 'Amanda King',
        phone: '+1-281-584-1390',
        category: 'Food Services'
    },
    {
        name: 'Aramark',
        email: 'business@aramark.com',
        contactPerson: 'Brian Scott',
        phone: '+1-215-238-3000',
        category: 'Food Services'
    },

    // Cleaning & Facilities
    {
        name: 'Cintas Corporation',
        email: 'sales@cintas.com',
        contactPerson: 'Nancy Green',
        phone: '+1-800-246-8271',
        category: 'Facilities'
    },
    {
        name: 'ABM Industries',
        email: 'corporate@abm.com',
        contactPerson: 'George Baker',
        phone: '+1-866-624-1520',
        category: 'Facilities'
    },

    // Security & Safety
    {
        name: 'ADT Commercial',
        email: 'commercial@adt.com',
        contactPerson: 'Karen Adams',
        phone: '+1-800-238-2727',
        category: 'Security'
    },
    {
        name: 'Honeywell Security',
        email: 'security@honeywell.com',
        contactPerson: 'Steven Turner',
        phone: '+1-800-345-6770',
        category: 'Security'
    }
];

const seedDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        applyDnsServers();
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB!');

        // Data is per-user. Seed into an existing account (npm run seed -- you@example.com)
        // or into a local demo account.
        const ownerEmail = (process.argv[2] || process.env.SEED_USER_EMAIL || 'demo@rfpmanager.local').toLowerCase();
        let user = await User.findOne({ email: ownerEmail });
        if (!user) {
            if (ownerEmail !== 'demo@rfpmanager.local') {
                throw new Error(`No user with email ${ownerEmail}. Sign up first, or run without an email to use the demo account.`);
            }
            user = await User.create({ name: 'Demo User', email: ownerEmail, password: 'demo1234', company: 'Demo Co' });
            console.log('👤 Created demo account: demo@rfpmanager.local / demo1234');
        }
        const owner = user._id;
        console.log(`👤 Seeding data for ${user.email}`);

        await Vendor.syncIndexes();

        console.log('\n🗑️  Clearing existing data for this user...');
        await Vendor.deleteMany({ owner });
        await RFP.deleteMany({ owner });
        await Proposal.deleteMany({ owner });

        console.log('\n👥 Creating comprehensive vendor database...');
        const vendors = await Vendor.insertMany(vendorDatabase.map((v) => ({ ...v, owner })));
        console.log(`✅ Created ${vendors.length} vendors across ${[...new Set(vendorDatabase.map(v => v.category))].length} categories`);

        // Show categories
        const categories = [...new Set(vendorDatabase.map(v => v.category))];
        console.log('\n📁 Categories:');
        categories.forEach(cat => {
            const count = vendors.filter(v => v.category === cat).length;
            console.log(`   - ${cat}: ${count} vendors`);
        });

        console.log('\n📝 Creating sample RFP...');
        const rfp = await RFP.create({
            owner,
            title: 'Office Laptop & Monitor Procurement',
            description: 'Procurement of laptops and monitors for new office setup. Requirements include business-grade laptops with minimum 16GB RAM and 27-inch monitors.',
            budget: 50000,
            currency: 'USD',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            items: [
                {
                    name: 'Business Laptop',
                    quantity: 20,
                    specs: '16GB RAM, Intel i7 or equivalent, 512GB SSD, Windows 11 Pro'
                },
                {
                    name: '27-inch Monitor',
                    quantity: 15,
                    specs: '4K resolution (3840x2160), IPS panel, HDMI + DisplayPort'
                }
            ],
            status: 'Draft',
            vendors: [
                vendors.find(v => v.name === 'Dell Technologies')._id,
                vendors.find(v => v.name === 'HP Enterprise')._id,
                vendors.find(v => v.name === 'Lenovo Corporation')._id
            ]
        });

        console.log('✅ Created sample RFP:', rfp.title);

        console.log('\n📧 Creating sample proposals...');
        const proposals = await Proposal.insertMany([
            {
                owner,
                rfpId: rfp._id,
                vendorId: vendors.find(v => v.name === 'Dell Technologies')._id,
                rawEmail: `Dear Team,

Thank you for considering Dell Technologies for your procurement needs.

Here is our competitive proposal:

Laptops - Dell Latitude 5540:
- Unit Price: $1,800
- Quantity: 20
- Subtotal: $36,000
- Specs: 16GB DDR5 RAM, Intel Core i7-13th Gen, 512GB NVMe SSD, Windows 11 Pro

Monitors - Dell UltraSharp U2723DE:
- Unit Price: $450
- Quantity: 15
- Subtotal: $6,750
- Specs: 27" 4K IPS, USB-C connectivity, 3-year warranty

Total Investment: $42,750
Delivery Timeline: 15-20 business days
Payment Terms: Net 30
Warranty: 3-year ProSupport with next-business-day onsite service

We look forward to serving you.

Best regards,
Dell Sales Team`,
                parsedData: {
                    totalPrice: 42750,
                    currency: 'USD',
                    items: [
                        { name: 'Dell Latitude 5540', unitPrice: 1800, quantity: 20, totalPrice: 36000 },
                        { name: 'Dell UltraSharp U2723DE', unitPrice: 450, quantity: 15, totalPrice: 6750 }
                    ],
                    deliveryTime: '15-20 business days',
                    paymentTerms: 'Net 30',
                    warranty: '3-year ProSupport with next-business-day onsite service',
                    notes: 'Includes USB-C connectivity on monitors'
                },
                status: 'Pending'
            },
            {
                owner,
                rfpId: rfp._id,
                vendorId: vendors.find(v => v.name === 'HP Enterprise')._id,
                rawEmail: `Hello,

Thank you for the opportunity. Please find our quotation below:

HP ProBook 450 G10 (20 units):
Price per unit: $1,900
Total: $38,000
Specifications: 16GB RAM, Intel Core i7, 512GB SSD, Win 11 Pro

HP E27 G5 Monitor (15 units):
Price per unit: $425
Total: $6,375
Specifications: 27" QHD, IPS, VESA mount compatible

Grand Total: $44,375
Lead Time: 25 working days
Payment: Net 30 days
Warranty: 1-year standard warranty

Regards,
HP Enterprise Team`,
                parsedData: {
                    totalPrice: 44375,
                    currency: 'USD',
                    items: [
                        { name: 'HP ProBook 450 G10', unitPrice: 1900, quantity: 20, totalPrice: 38000 },
                        { name: 'HP E27 G5 Monitor', unitPrice: 425, quantity: 15, totalPrice: 6375 }
                    ],
                    deliveryTime: '25 working days',
                    paymentTerms: 'Net 30 days',
                    warranty: '1-year standard warranty',
                    notes: 'VESA mount compatible monitors'
                },
                status: 'Pending'
            },
            {
                owner,
                rfpId: rfp._id,
                vendorId: vendors.find(v => v.name === 'Lenovo Corporation')._id,
                rawEmail: `Dear Procurement Team,

We appreciate the opportunity to quote for your requirements.

ThinkPad E14 Gen 5 Laptops:
Quantity: 20 units
Unit Cost: $1,750
Subtotal: $35,000
Details: 16GB DDR4, Intel i7-1355U, 512GB PCIe SSD, Win 11 Pro

ThinkVision T27hv-30 27" Monitors:
Quantity: 15 units  
Unit Cost: $480
Subtotal: $7,200
Details: 2560x1440 QHD, IPS, USB Type-C

Total Quotation: $42,200
Estimated Delivery: 18-22 business days
Payment Terms: Net 30 from delivery
Standard Warranty: 2 years parts & labor

Best regards,
Lenovo Sales`,
                parsedData: {
                    totalPrice: 42200,
                    currency: 'USD',
                    items: [
                        { name: 'ThinkPad E14 Gen 5', unitPrice: 1750, quantity: 20, totalPrice: 35000 },
                        { name: 'ThinkVision T27hv-30', unitPrice: 480, quantity: 15, totalPrice: 7200 }
                    ],
                    deliveryTime: '18-22 business days',
                    paymentTerms: 'Net 30 from delivery',
                    warranty: '2 years parts & labor',
                    notes: 'USB Type-C connectivity included'
                },
                status: 'Pending'
            }
        ]);

        console.log(`✅ Created ${proposals.length} sample proposals`);

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Database: rfp_manager`);
        console.log(`   Vendors: ${vendors.length} (Pre-populated marketplace)`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   RFPs: 1 (sample)`);
        console.log(`   Proposals: ${proposals.length}`);
        console.log('\n🎯 Users can now:');
        console.log('   1. Browse pre-populated vendor marketplace');
        console.log('   2. Select vendors by category');
        console.log('   3. Send RFPs immediately without manual data entry');
        console.log('   4. Add custom vendors if needed');
        console.log('\n💡 Start the app and check the Vendors tab!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
