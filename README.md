# 🤖 AI Receptionist WhatsApp Platform

An AI-powered receptionist that automatically replies to customer WhatsApp messages using Google Gemini. Multi-tenant SaaS platform with admin dashboard.

---

## 📌 1. Project Structure

```
agentm/
├── backend/           # Express.js API (Port 5000)
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── db/        # Schema, seed data, init script
│   │   ├── middleware/ # JWT auth middleware
│   │   ├── routes/    # API routes (auth, tenants, knowledge, conversations, webhook)
│   │   ├── services/  # AI (Gemini) & WhatsApp services
│   │   ├── __tests__/ # Jest unit tests
│   │   └── index.js   # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── dashboard/         # Next.js Admin Dashboard (Port 3000)
│   ├── src/
│   │   ├── app/       # Pages (login, signup, dashboard, conversations, knowledge, settings)
│   │   ├── components/ # Sidebar, DashboardLayout
│   │   └── lib/       # API client, Auth context
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🚀 2. Quick Start

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../dashboard && npm install

# 2. Configure environment
cd ../backend
cp .env.example .env
# Edit .env with your Gemini API key and database credentials

# 3. Initialize database (creates tables + demo data)
npm run db:init

# 4. Start backend (Terminal 1)
npm run dev

# 5. Start dashboard (Terminal 2)
cd ../dashboard
npm run dev
```

### Demo Login
- **URL:** http://localhost:3000/login
- **Email:** `demo@clinic.com`
- **Password:** `demo123`

---

## 🏗️ 3. Architecture

```
                  ┌─────────────────────────────────────┐
                  │      WhatsApp User (Customer)       │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Meta WhatsApp Business API       │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼ Webhook
┌─────────────────────────────────────────────────────────────────────────┐
│ Express.js Backend (Port 5000)                                          │
│                                                                         │
│  1. Identify Client Tenant (via Phone Number ID)                        │
│  2. Fetch Tenant FAQs & Services from Database                          │
│  3. Check Human Takeover Mode                                           │
│  4. Send to Google Gemini to generate natural reply                     │
│  5. Send reply back to customer on WhatsApp                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────┴────────────────────────────────────┐
│ Supabase Cloud Database (PostgreSQL)                                    │
│ Tables: tenants, knowledge_items, contacts, conversations, messages,    │
│         appointments                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 4. Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port (default: 5000) | No |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GEMINI_MODEL` | Gemini model (default: `gemini-flash-latest`) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | Yes |

---

## 📱 5. Connecting WhatsApp (Meta Cloud API)

1. Create a Business App at [developers.facebook.com](https://developers.facebook.com)
2. Add **WhatsApp** product
3. Configure **Webhook**:
   - **URL:** `https://<your-public-url>/api/webhook`
   - **Verify Token:** your `WHATSAPP_VERIFY_TOKEN` value
4. Copy `Phone Number ID` and `Access Token` into **Dashboard → Settings**

---

## 🧪 6. Testing

```bash
cd backend
npm test
```

---

## 🐳 7. Docker Deployment

```bash
# Build and run everything
docker-compose up --build

# Or deploy individually
cd backend && docker build -t ai-receptionist-backend .
cd dashboard && docker build -t ai-receptionist-dashboard .
```

---

## ☁️ 8. Free Hosting (Recommended for Startups)

| Service | Platform | Cost |
|---|---|---|
| Dashboard (Next.js) | [Vercel](https://vercel.com) | Free |
| Backend (Express.js) | [Render](https://render.com) | Free |
| Database | [Supabase](https://supabase.com) | Free (500MB) |
| AI | [Google Gemini](https://aistudio.google.com) | Free (1,500 req/day) |

---

## 📊 9. Monetization

| Plan | Price | Features |
|---|---|---|
| **Starter** | $49/mo | 1,000 messages/mo, FAQs, 1 WhatsApp number |
| **Professional** | $149/mo | 5,000 messages/mo, human takeover, appointments |
| **Enterprise** | $349/mo | 20,000 messages/mo, custom integrations, SLA |
