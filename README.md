# AI-Powered RFP Management System

An intelligent procurement platform that uses AI to create, manage, and evaluate RFPs (Request for Proposals) through natural language processing.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenAI API Key
- Gmail account with App Password (for email features)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd aerchain_assignment

# Backend setup
cd backend
npm install
cp .env.example .env  # Edit with your credentials

# Frontend setup
cd ../frontend
npm install
```

### Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rfp_manager
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key

# Email (Gmail with App Password)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-app-password
```

### Running the App

```bash
# Terminal 1 - Backend
cd backend && npm run start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Seed Data (Optional)
```bash
cd backend && node seed.js
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI | OpenAI GPT-4o-mini |
| Email | Nodemailer (SMTP), imap-simple (IMAP) |
| Auth | JWT, bcryptjs |

---

## Core Features

### 1. Natural Language RFP Creation
- Describe procurement needs in plain English
- AI extracts: title, description, budget, deadline, items, specs

### 2. Vendor Management
- CRUD operations for vendors
- Categories: IT Equipment, Office Supplies, etc.

### 3. Email-Based Proposal Workflow
- Send RFPs to vendors via email
- Fetch vendor replies from mailbox (IMAP)
- AI parses unstructured email into structured proposal data

### 4. AI Proposal Comparison
- Compare multiple vendor proposals
- AI scores vendors on price, delivery, warranty
- Generates recommendation with reasoning

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### RFPs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rfps` | Create RFP from natural language |
| GET | `/api/rfps` | List all RFPs |
| GET | `/api/rfps/:id` | Get single RFP |
| POST | `/api/rfps/send` | Send RFP to vendors |
| PUT | `/api/rfps/:id` | Update RFP |
| DELETE | `/api/rfps/:id` | Delete RFP |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vendors` | Create vendor |
| GET | `/api/vendors` | List all vendors |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/proposals/fetch/:rfpId` | Fetch vendor emails & parse |
| GET | `/api/proposals/rfp/:rfpId` | Get proposals for RFP |
| GET | `/api/proposals/compare/:rfpId` | AI comparison |

---

## Design Decisions

### Why Email-Based Workflow?
- Real-world procurement uses email
- Vendors don't need to learn a new system
- Demonstrates AI parsing capability

### Why MongoDB?
- Flexible schema for varying RFP structures
- JSON-native (matches AI output)
- Fast prototyping

### Why GPT-4o-mini?
- Cost-effective (~1000x cheaper than GPT-4)
- Fast responses (2-3 seconds)
- Sufficient for structured extraction

---

## Assumptions

1. **Email**: Vendors reply to same email thread; Gmail IMAP is used
2. **Currency**: USD default (can be changed per RFP)
3. **Data**: One proposal per vendor per RFP
4. **Users**: Single-user system (no multi-tenancy)

---

## Project Structure

```
aerchain_assignment/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # AI & Email services
│   ├── middleware/      # Auth middleware
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── services/    # API client
│   └── index.html
└── README.md
```

---

## AI Integration

### Services (backend/services/aiService.js)

1. **generateRFPFromNL()** - Natural language → Structured RFP
2. **parseVendorResponse()** - Email text → Structured proposal
3. **compareProposals()** - Multi-proposal analysis & recommendation

### Configuration
- Model: `gpt-4o-mini`
- Temperature: `0.3` (for consistency)
- Response format: `json_object` (guaranteed valid JSON)

---

## Gmail Setup

1. Enable 2FA on Google account
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Enable IMAP in Gmail: Settings → Forwarding and POP/IMAP
4. Use App Password (not regular password) in .env

---

## Security Features

- Helmet.js for HTTP security headers
- Rate limiting (5 login attempts / 15 min)
- CORS restricted to frontend origin
- JWT authentication
- Password hashing with bcrypt

---

## License

MIT
