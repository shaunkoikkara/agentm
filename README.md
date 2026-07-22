# 🤖 AI Receptionist WhatsApp Platform — Master Guide

Everything from our discussion, design decisions, database schemas, credentials, and code structure is documented below.

---

## 📌 1. Project Location & Quick Links

- **Backend Folder:** `c:\Users\Admin\grpm\YYY\heir\ai-receptionist\backend`
- **Dashboard Folder:** `c:\Users\Admin\grpm\YYY\heir\ai-receptionist\dashboard`
- **Admin Dashboard URL:** [http://localhost:3000](http://localhost:3000)
- **Backend API URL:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 2. Credentials & Environment Setup

### Demo Account (Login at http://localhost:3000/login)
- **Email:** `demo@clinic.com`
- **Password:** `demo123`

### Database (Supabase PostgreSQL)
- **Host:** `aws-0-ap-northeast-1.pooler.supabase.com`
- **Database URL:** `postgres://postgres.mztdrqraodqxdwuipbqc:cligent10101met@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
- **Supabase Project URL:** `https://mztdrqraodqxdwuipbqc.supabase.co`

---

## 🏗️ 3. Platform Architecture

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
│  2. Fetch Tenant FAQs & Services from Supabase                           │
│  3. Check Human Takeover Mode                                           │
│  4. Send to OpenAI (GPT-4o-mini) to generate natural reply               │
│  5. Send reply back to customer on WhatsApp                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────┴────────────────────────────────────┐
│ Supabase Cloud Database (PostgreSQL)                                    │
│ Tables: tenants, knowledge_items, contacts, conversations, messages...  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 4. How to Start / Stop Servers

### Terminal 1: Backend API
```powershell
cd c:\Users\Admin\grpm\YYY\heir\ai-receptionist\backend
npm start
```

### Terminal 2: Dashboard Frontend
```powershell
cd c:\Users\Admin\grpm\YYY\heir\ai-receptionist\dashboard
npm run dev
```

---

## 📱 5. Connecting WhatsApp (Meta Cloud API)

1. Create a Business App at [developers.facebook.com](https://developers.facebook.com)
2. Add **WhatsApp** product.
3. Configure **Webhook**:
   - **URL:** `https://<your-public-url>/api/webhook`
   - **Verify Token:** `ai_receptionist_verify_token_123`
4. Copy `Phone Number ID` and `Access Token` into **Dashboard ➔ Settings**.

---

## 📊 6. Monetization & Business Model

| Plan | Price | Target Audience | Features |
|---|---|---|---|
| **Starter** | $49 / month | Small businesses, solo practitioners | 1,000 messages/mo, FAQs, 1 WhatsApp number |
| **Professional** | $149 / month | Clinics, restaurants, services | 5,000 messages/mo, human takeover, appointment booking |
| **Enterprise** | $349 / month | Multi-location businesses | 20,000 messages/mo, custom CRM integrations, dedicated SLA |

---

## 🗂️ 7. Full Conversation Artifacts Saved Locally

You can view the original full blueprints created during our chat here:
- [Platform Blueprint Document](file:///C:/Users/Admin/.gemini/antigravity/brain/2bbd026f-03a0-4628-bd56-82e07854b64c/ai_receptionist_platform.md)
- [Implementation Plan](file:///C:/Users/Admin/.gemini/antigravity/brain/2bbd026f-03a0-4628-bd56-82e07854b64c/implementation_plan.md)
- [Launch Walkthrough](file:///C:/Users/Admin/.gemini/antigravity/brain/2bbd026f-03a0-4628-bd56-82e07854b64c/walkthrough.md)
