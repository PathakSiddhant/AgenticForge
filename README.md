<div align="center">

<img src="https://img.shields.io/badge/AgenticForge-AI%20Workforce%20Platform-6366f1?style=for-the-badge&logo=openai&logoColor=white" />

<p align="center">
  <img src="web-app/public/logo.png" alt="AgenticForge Logo" width="80" style="vertical-align: middle; margin-right: 10px;" />
  <span style="font-size: 40px; font-weight: bold; vertical-align: middle;">
    AgenticForge
  </span>
</p>

### *Build AI agents that don't just talk — they execute.*

**AgenticForge** is a full-stack AI agent platform that deploys autonomous digital workers across Sales, Healthcare, HR, Finance, Logistics, Media, and more. It goes beyond chatbots — every agent reasons, calls tools, queries databases, sends emails, and executes real backend workflows without human intervention.

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-agentic--forge.vercel.app-22c55e?style=for-the-badge)](https://agentic-forge.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️%20Backend-Render.com-6366f1?style=for-the-badge)](https://agenticforge.onrender.com)
[![Made with](https://img.shields.io/badge/Made%20with-Next.js%20+%20FastAPI%20+%20Gemini-0ea5e9?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](#)

</div>

---

## 📌 Table of Contents

- [What is AgenticForge?](#-what-is-agenticforge)
- [Live Demo](#-live-demo)
- [Enterprise Workflows](#-enterprise-workflows-flagship-features)
  - [LeadForge AI SDR](#1--leadforge-ai-sdr--the-relentless-revenue-engine)
  - [MediForge Receptionist](#2--mediforge-ai-receptionist--the-hospital-front-desk-reimagined)
- [27 Micro-Agents](#-27-production-ready-micro-agents)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup-ai-engine)
  - [Frontend Setup](#frontend-setup-web-app)
  - [Environment Variables](#environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [What I Learned](#-what-i-learned)
- [Author](#-author)

---

## 🧠 What is AgenticForge?

Most AI projects are demos. AgenticForge is a **production-grade, multi-agent platform** built to simulate how a real AI automation agency would operate.

The platform has two distinct layers:

**1. Enterprise Workflows** — Two deeply integrated, end-to-end autonomous systems:
- **LeadForge**: A full sales pipeline that captures leads from a web form *and* a live Gmail inbox, scores them with AI, sends personalized emails, and lets a RAG-powered SDR chatbot book meetings — all without a human touching anything.
- **MediForge**: A hospital receptionist agent with voice (Vapi.ai), WhatsApp (Twilio), and text interfaces that books appointments via agentic function calling, generates PDF appointment slips, and sends them via WhatsApp — 24/7.

**2. 27 Micro-Agents** — A library of standalone AI agents across 8 industry verticals, each powered by Gemini 2.5 Flash with structured JSON output schemas. These agents cover everything from resume screening to freight optimization to viral hook generation.

> This project was built as a 3rd-year CS student to explore agentic AI patterns, RAG pipelines, function calling, and full-stack deployment — and to have something genuinely impressive to show.

---

## 🌐 Live Demo

| Layer | URL |
|---|---|
| 🌐 Frontend (Next.js) | [agentic-forge.vercel.app](https://agentic-forge.vercel.app) |
| ⚙️ Backend API (FastAPI) | [agenticforge.onrender.com](https://agenticforge.onrender.com) |
| 📄 API Docs (Swagger) | [agenticforge.onrender.com/docs](https://agenticforge.onrender.com/docs) |

> **Note:** The backend is hosted on Render's free tier and may take 30–60 seconds to wake up on the first request. This is expected.

---

## 🏆 Enterprise Workflows — Flagship Features

### 1. 🎯 LeadForge AI SDR — *The Relentless Revenue Engine*

LeadForge is a fully autonomous B2B sales pipeline. From the moment a lead enters the system to the moment a meeting is booked — no human is required.

#### How the full flow works:

```
Lead Entry (2 sources)
    ├── Website Form → POST /api/leads/submit
    └── Gmail Inbox → Background thread polls IMAP every 15 seconds
              ↓
    Smart Spam Filter (rule-based, saves Gemini quota)
              ↓
    Gemini Extractor (messy email → structured JSON)
              ↓
    AI Lead Scorer (Gemini 2.5 Flash)
    ├── Score 0–100 based on: budget, timeline, company size, pain point
    ├── Hot (75+)  → Direct meeting CTA email
    ├── Warm (40–74) → Hyper-personalized AI nurture email
    └── Cold (<40)   → Newsletter drip
              ↓
    PostgreSQL + BackgroundTasks (async email send, non-blocking)
              ↓
    Hot lead visits /book-call?lead_id=X
              ↓
    RAG SDR Chatbot
    ├── Gemini Embedding → Pinecone vector search (top-2 chunks)
    ├── Lead context fetched from DB
    ├── Dynamic prompt: context + RAG + meeting state
    └── If AI returns {"action": "book_meeting", "date": ..., "time": ...}
              → DB INSERT + Google Meet link generated + confirmation email sent
```

#### Key technical decisions:
- **Background thread** (`threading.Thread`) monitors Gmail inbox at startup — no external cron job needed
- **Pinecone RAG** — company knowledge (pricing, services, objections) vectorized and retrieved semantically
- **Structured output** — `score`, `status`, `reasoning` returned as clean JSON from Gemini, no markdown stripping guesswork
- **Reschedule logic** — AI detects if a meeting already exists and updates instead of creating a duplicate

---

### 2. 🏥 MediForge AI Receptionist — *The Hospital Front-Desk, Reimagined*

MediForge is a conversational AI hospital receptionist that operates across three independent channels: text chat, WhatsApp, and voice calls. It books appointments, handles reschedules, cancellations, and lookups — all through agentic function calling.

#### How the full flow works:

```
Patient Entry (3 channels)
    ├── Text Chat    → POST /api/mediforge/chat
    ├── WhatsApp     → POST /api/whatsapp (Twilio webhook → TwiML response)
    └── Voice Call   → Vapi.ai SDK → POST /api/vapi/webhook (manual tool dispatch)
              ↓
    Time Guard (Python code level)
    └── IST timezone check: if >4 PM + "aaj/today" → inject hidden "closed" instruction
              ↓
    Gemini 2.5 Flash — MediForgeReceptionist class
    ├── System prompt: today's date, hospital hours, 6 specialties, language mirror rule
    ├── enable_automatic_function_calling = True
    └── tools = [check_availability, book_appointment, lookup_appointment, cancel_appointment]
              ↓
    AI autonomously decides which tool(s) to call
    ├── check_availability(specialty, date)
    │       └── IST buffer: now + 30 min > slot_time → skip
    │       └── Max 2 patients per 30-min slot rule
    ├── book_appointment(name, phone, specialty, date, time, symptoms)
    │       └── DB INSERT → FPDF2 PDF generated → Twilio WhatsApp sent
    ├── lookup_appointment(phone) → JOIN query → returns existing appointment
    └── cancel_appointment(phone) → hard DELETE from appointments table
              ↓
    Post-booking pipeline (inside book_appointment)
    ├── FPDF2 → A4 PDF with MRN, slot, doctor, pre-visit instructions
    ├── Saved to /static/MF-Booking-{phone}.pdf (served via FastAPI StaticFiles)
    └── Twilio → WhatsApp message + PDF URL → patient's phone
```

#### Key technical decisions:
- **Agentic pattern** — Gemini is given Python functions as tools; it decides what to call. Zero hardcoded `if "book" in message` logic.
- **Language mirroring** — System prompt instructs AI to reply in the patient's language (Hindi, Hinglish, English). One prompt, multilingual behavior.
- **Voice path is architecturally separate** — Vapi.ai handles NLU for voice; the backend only receives tool-call JSON and dispatches manually via `if/elif`. Gemini is not involved in the voice path.
- **Admin dashboard** (Next.js) — Full calendar view, manual walk-in booking modal, edit/delete, doctor filter — all as a parallel CRUD path with no AI involvement.

---

## 🤖 27 Production-Ready Micro-Agents

Each agent is a standalone FastAPI endpoint powered by Gemini 2.5 Flash with a strict Pydantic response schema. All return structured JSON — no raw text parsing.

| Category | Agent | What it does |
|---|---|---|
| 🛠️ **Developer Sandbox** | Data Structurer | Converts messy text/JSON into clean structured schemas |
| | Contextual Memory Bot | Multi-turn chat with full conversation history |
| | Tool Caller | Demonstrates Gemini function calling with real tools |
| | Document Reader | Extracts and analyzes content from uploaded PDFs |
| 📈 **Finance & Trading** | Market Intel Agent | SWOT analysis + sentiment + competitor mapping |
| | Portfolio Risk Analyzer | Risk scoring + diversification recommendations |
| | Earnings Report RAG | Q&A over uploaded earnings PDFs |
| 🤝 **Human Resources** | Resume Screener | PDF resume vs JD → match score + verdict + gaps |
| | Interview Planner | Generates role-specific interview question banks |
| | Onboarding RAG | Q&A over company policy documents |
| 🎓 **Education & Research** | Research Analyzer | Extracts methodology, findings, limitations from papers |
| | Edu-Planner Agent | Personalized study plans with timelines |
| | Essay Evaluator | Grades essays with rubric-based structured feedback |
| 💸 **Sales & Marketing** | Cold Outreach Architect | Hyper-personalized B2B cold email generator |
| | SEO Analyzer | Article audit → score + missing LSI keywords + fixes |
| | Churn Predictor | Customer sentiment → churn risk + retention strategy |
| 🎧 **Customer Support** | Omni-Channel Ticket Router | Classifies and routes support tickets by priority/type |
| | Auto Responder | Drafts empathetic policy-compliant customer replies |
| | Refund Automator | Processes refund requests against company policy |
| 📦 **Logistics & Supply Chain** | AI Inventory Forecaster | Demand forecasting + reorder recommendations |
| | Supplier Risk Evaluator | Risk scoring for vendor/supplier profiles |
| | Freight & Route Optimizer | Optimal shipping route + cost analysis |
| 🎬 **Media & Content** | Viral Hook Architect | Generates scroll-stopping hooks for any platform |
| | The Raw Scriptwriter | Long-form video scripts with pacing and structure |
| | The Content Repurposer | Transforms long-form content → Twitter + LinkedIn + Reels |
| ✈️ **Travel & Events** | Hyper-Personalized Itinerary | Day-by-day travel plans with local context |
| | Vendor Negotiator | Negotiation scripts + pricing strategy for events |
| | Crisis Manager | Instant action plan for event/travel emergencies |

---

## 🛠️ Tech Stack

### Backend (`ai-engine/`)
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework — async, fast, auto Swagger docs |
| **Gemini 2.5 Flash** | Primary LLM for all agents (Google GenAI SDK) |
| **Gemini Embedding 001** | Text vectorization for RAG pipeline |
| **Pinecone** | Vector database — stores AgenticForge knowledge base |
| **PostgreSQL (Neon)** | Serverless relational DB — leads, meetings, appointments, doctors |
| **psycopg2** | PostgreSQL driver with `RealDictCursor` for dict-style rows |
| **FPDF2** | PDF generation for appointment confirmation slips |
| **PyPDF2** | PDF text extraction for resume screener + research analyzer |
| **Twilio** | WhatsApp Business API for post-booking patient notifications |
| **Vapi.ai** | Voice AI SDK — handles NLU for phone call appointments |
| **Python `threading`** | Background daemon for Gmail inbox polling |
| **Python `imaplib`** | Gmail IMAP connection for inbound email monitoring |
| **smtplib** | Gmail SMTP for outbound transactional emails |
| **Pydantic** | Request/response validation + structured output schemas |
| **python-dotenv** | Environment variable management |

### Frontend (`web-app/`)
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework — App Router, server/client components |
| **TypeScript** | Type safety across all components and API calls |
| **Tailwind CSS v4** | Utility-first styling |
| **Clerk** | Authentication — sign-up, sign-in, route protection via middleware |
| **Drizzle ORM** | Type-safe PostgreSQL ORM for schema definition |
| **@vapi-ai/web** | Voice call SDK for MediForge voice interface |
| **Vercel** | Frontend deployment + CDN |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        PATIENT / USER                        │
│         Text Chat │ WhatsApp │ Voice Call │ Web Dashboard    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    NEXT.JS FRONTEND (Vercel)                  │
│  Dashboard │ 27 Agent UIs │ LeadForge CRM │ MediForge HQ     │
│  Clerk Auth Middleware → protects all /dashboard/* routes    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────▼──────────────────────────────┐
│                   FASTAPI BACKEND (Render)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  ENTERPRISE WORKFLOWS                                │     │
│  │  LeadForge: /api/leads/* + /api/chat/book            │     │
│  │  MediForge: /api/mediforge/* + /api/whatsapp         │     │
│  │             /api/vapi/webhook                        │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  27 MICRO-AGENT ROUTERS                              │     │
│  │  /api/sales/* │ /api/hr/* │ /api/finance/*           │     │
│  │  /api/support/* │ /api/logistics/* │ /api/media/*    │     │
│  │  /api/travel/* │ /api/education/*                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────┐   ┌──────────────────────────────┐   │
│  │  Background Thread │   │  Gemini 2.5 Flash            │   │
│  │  Gmail IMAP poll   │   │  (all agents + scoring)      │   │
│  │  every 15 seconds  │   │  Structured JSON output      │   │
│  └────────────────────┘   └──────────────────────────────┘   │
└───────┬──────────────────────────────────────┬───────────────┘
        │                                       │
┌───────▼────────┐                   ┌──────────▼──────────────┐
│  PostgreSQL    │                   │  Pinecone Vector DB      │
│  (Neon)        │                   │  AgenticForge knowledge  │
│  leads         │                   │  4 knowledge files       │
│  meetings      │                   │  → vectorized + indexed  │
│  appointments  │                   └─────────────────────────┘
│  doctors       │
└────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- LeadForge CRM
CREATE TABLE leads (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  company_name  VARCHAR(150),
  company_size  VARCHAR(50),   -- "1-10", "11-50", "51-200", "200+"
  budget        VARCHAR(50),   -- "<$1k", "$1k-$5k", "$5k-$10k", "$10k+"
  timeline      VARCHAR(50),   -- "ASAP", "1-3 months", "3-6 months"
  pain_point    TEXT,
  source        VARCHAR(50) DEFAULT 'Website Form',
  ai_score      INTEGER DEFAULT 0,
  lead_status   VARCHAR(50) DEFAULT 'New', -- New, Hot, Warm, Cold, Meeting Scheduled
  ai_reasoning  TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meetings (
  id            SERIAL PRIMARY KEY,
  lead_id       INTEGER REFERENCES leads(id),
  meeting_date  VARCHAR(20),
  meeting_time  VARCHAR(20),
  meet_link     TEXT,
  notes         TEXT
);

-- MediForge Hospital
CREATE TABLE doctors (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  specialty     VARCHAR(255) NOT NULL,  -- Cardiology, Dermatology, Neurology...
  availability  TEXT
);

CREATE TABLE appointments (
  id               SERIAL PRIMARY KEY,
  patient_name     VARCHAR(255) NOT NULL,
  patient_phone    VARCHAR(20) NOT NULL,
  doctor_id        INTEGER REFERENCES doctors(id),
  appointment_date TIMESTAMP NOT NULL,
  status           VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Confirmed, Cancelled
  notes            TEXT
);
```

---

## 📁 Project Structure

```
AgenticForge/
│
├── ai-engine/                          # Python FastAPI Backend
│   ├── agents/                         # 27 standalone AI agent modules
│   │   ├── lead_scorer.py              # LeadForge: AI scoring (0-100)
│   │   ├── mediforge_receptionist.py   # MediForge: agentic receptionist
│   │   ├── auto_responder.py           # Support: customer reply drafter
│   │   ├── churn_predictor.py          # Sales: churn risk analyzer
│   │   ├── cold_outreach.py            # Sales: B2B cold email generator
│   │   ├── content_repurposer.py       # Media: multi-platform repurposer
│   │   ├── crisis_manager.py           # Travel: crisis action planner
│   │   ├── data_structurer.py          # Sandbox: JSON structurer
│   │   ├── document_reader.py          # Sandbox: PDF reader
│   │   ├── earnings_rag.py             # Finance: earnings report RAG
│   │   ├── edu_planner.py              # Education: study planner
│   │   ├── essay_evaluator.py          # Education: essay grader
│   │   ├── freight_optimizer.py        # Logistics: route optimizer
│   │   ├── interview_planner.py        # HR: interview question bank
│   │   ├── inventory_forecaster.py     # Logistics: demand forecasting
│   │   ├── itinerary_planner.py        # Travel: trip planner
│   │   ├── market_intel.py             # Finance: SWOT + market sentiment
│   │   ├── memory_bot.py               # Sandbox: contextual memory chat
│   │   ├── onboarding_rag.py           # HR: policy Q&A
│   │   ├── portfolio_risk.py           # Finance: portfolio analyzer
│   │   ├── raw_scriptwriter.py         # Media: video scriptwriter
│   │   ├── refund_automator.py         # Support: refund processor
│   │   ├── research_analyzer.py        # Education: paper analyzer
│   │   ├── resume_screener.py          # HR: resume vs JD matcher
│   │   ├── seo_analyzer.py             # Sales: SEO auditor
│   │   ├── supplier_risk.py            # Logistics: vendor risk
│   │   ├── ticket_router.py            # Support: ticket classifier
│   │   ├── tool_caller.py              # Sandbox: function calling demo
│   │   ├── vendor_negotiator.py        # Travel: negotiation scripts
│   │   └── viral_hook_generator.py     # Media: hook architect
│   │
│   ├── knowledge/                      # RAG knowledge base (LeadForge)
│   │   ├── 01_company_overview_and_services.txt
│   │   ├── 02_pricing_and_timelines.txt
│   │   ├── 03_sales_playbook_objections.txt
│   │   └── 04_technical_faq.txt
│   │
│   ├── scripts/
│   │   ├── ingest_data.py              # Vectorizes knowledge → Pinecone
│   │   └── test_models.py              # Agent testing scripts
│   │
│   ├── services/
│   │   ├── email_listener.py           # Gmail IMAP poller + Gemini extractor
│   │   └── email_sender.py             # SMTP sender (Hot/Warm/Cold emails)
│   │
│   ├── db.py                           # PostgreSQL connection (psycopg2)
│   ├── main.py                         # FastAPI app + all route registration
│   ├── seed_db.py                      # Seeds 15 doctors + 40 demo appointments
│   ├── utils.py                        # FPDF2 PDF gen + Twilio WhatsApp sender
│   └── requirements.txt
│
├── web-app/                            # Next.js 16 Frontend
│   └── src/
│       ├── app/
│       │   ├── workflows/
│       │   │   ├── leadforge/          # LeadForge CRM dashboard
│       │   │   └── mediforge/          # MediForge HQ (calendar + AI chat)
│       │   ├── book-call/              # RAG SDR chatbot (lead-specific)
│       │   ├── dashboard/              # Main agent hub
│       │   ├── sales/                  # 3 sales agents
│       │   ├── hr/                     # 3 HR agents
│       │   ├── finance/                # 3 finance agents
│       │   ├── education/              # 3 education agents
│       │   ├── support/                # 3 support agents
│       │   ├── logistics/              # 3 logistics agents
│       │   ├── media/                  # 3 media agents
│       │   ├── travel/                 # 3 travel agents
│       │   ├── sandbox/                # 4 developer sandbox agents
│       │   ├── sign-in/                # Clerk auth
│       │   └── sign-up/                # Clerk auth
│       ├── components/
│       │   └── Sidebar.tsx             # Global navigation
│       ├── db/
│       │   └── schema.ts               # Drizzle ORM schema definitions
│       ├── lib/
│       │   └── agents.ts               # Master agent registry
│       └── middleware.ts               # Clerk route protection
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

You will also need API keys for the following services:

| Service | Purpose | Free Tier? |
|---|---|---|
| [Google AI Studio](https://aistudio.google.com) | Gemini 2.5 Flash + Embedding | ✅ Yes |
| [Pinecone](https://pinecone.io) | Vector DB for RAG | ✅ Yes (1 index) |
| [Neon](https://neon.tech) | Serverless PostgreSQL | ✅ Yes |
| [Clerk](https://clerk.com) | Authentication | ✅ Yes |
| [Twilio](https://twilio.com) | WhatsApp API | ⚠️ Trial |
| [Vapi.ai](https://vapi.ai) | Voice AI | ⚠️ Trial credits |
| Gmail Account | IMAP/SMTP for LeadForge | ✅ (App Password) |

---

### Backend Setup (`ai-engine/`)

**Step 1 — Clone the repository**

```bash
git clone https://github.com/your-username/agenticforge.git
cd agenticforge/ai-engine
```

**Step 2 — Create and activate a virtual environment**

```bash
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

**Step 3 — Install dependencies**

```bash
pip install -r requirements.txt
```

**Step 4 — Set up environment variables**

Create a `.env` file inside `ai-engine/`:

```env
# Gemini (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Pinecone (for LeadForge RAG)
PINECONE_API_KEY=your_pinecone_api_key_here

# Gmail (LeadForge email pipeline)
SENDER_EMAIL=your_gmail@gmail.com
SENDER_PASSWORD=your_gmail_app_password   # NOT your real password — use App Password

# Twilio (MediForge WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Base URL (for PDF static file serving)
BASE_URL=http://localhost:8000
```

> **Gmail App Password:** Go to your Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail". Use that as `SENDER_PASSWORD`.

**Step 5 — Initialize the database**

```bash
python seed_db.py
```

This seeds 15 doctors across 6 specialties and 40 demo appointments into your Neon database.

**Step 6 — Ingest knowledge base into Pinecone** *(for LeadForge RAG)*

```bash
python scripts/ingest_data.py
```

This vectorizes the 4 knowledge files in `knowledge/` and pushes them to your Pinecone index.

**Step 7 — Run the backend**

```bash
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

---

### Frontend Setup (`web-app/`)

**Step 1 — Navigate to the web-app folder**

```bash
cd ../web-app
```

**Step 2 — Install dependencies**

```bash
npm install
```

**Step 3 — Set up environment variables**

Create a `.env.local` file inside `web-app/`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# PostgreSQL (Neon — same DB as backend)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Vapi.ai Voice (MediForge)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

**Step 4 — Run the frontend**

```bash
npm run dev
```

The app will be live at `http://localhost:3000`

---

### Environment Variables

Quick reference — all variables across both services:

| Variable | Service | Required | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Backend | ✅ | Google AI Studio key |
| `DATABASE_URL` | Both | ✅ | Neon PostgreSQL connection string |
| `PINECONE_API_KEY` | Backend | ✅ | Pinecone vector DB key |
| `SENDER_EMAIL` | Backend | ✅ | Gmail address for LeadForge |
| `SENDER_PASSWORD` | Backend | ✅ | Gmail App Password |
| `TWILIO_ACCOUNT_SID` | Backend | ⚠️ | Twilio SID (MediForge WhatsApp) |
| `TWILIO_AUTH_TOKEN` | Backend | ⚠️ | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | Backend | ⚠️ | Twilio sandbox number |
| `BASE_URL` | Backend | ✅ | Backend base URL for PDF links |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend | ✅ | Clerk public key |
| `CLERK_SECRET_KEY` | Frontend | ✅ | Clerk secret key |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Frontend | ⚠️ | Vapi.ai public key |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Frontend | ⚠️ | Vapi assistant ID |

> ⚠️ = Required only for MediForge voice/WhatsApp features. Core functionality works without these.

---

## 📡 API Reference

### LeadForge Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/leads/submit` | Submit a new lead (triggers AI scoring + email) |
| `GET` | `/api/leads` | Fetch all leads for dashboard |
| `PUT` | `/api/leads/{lead_id}` | Update a lead |
| `DELETE` | `/api/leads/{lead_id}` | Delete a lead |
| `POST` | `/api/leads/schedule-manual` | Manually schedule a meeting |
| `GET` | `/api/leads/meetings` | Fetch all scheduled meetings |
| `DELETE` | `/api/leads/meetings/{lead_id}/complete` | Mark meeting as complete |
| `POST` | `/api/chat/book` | RAG SDR chatbot (lead-specific booking) |

### MediForge Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/mediforge/chat` | Send message to AI receptionist |
| `GET` | `/api/mediforge/appointments` | Fetch all appointments |
| `POST` | `/api/mediforge/appointments/manual` | Manual walk-in booking |
| `PUT` | `/api/mediforge/appointments/{apt_id}` | Edit appointment |
| `DELETE` | `/api/mediforge/appointments/{apt_id}` | Delete appointment |
| `GET` | `/api/mediforge/doctors` | Fetch all doctors |
| `POST` | `/api/whatsapp` | Twilio WhatsApp webhook |
| `POST` | `/api/vapi/webhook` | Vapi.ai voice tool dispatch |

### Micro-Agent Endpoints (sample)

| Method | Endpoint | Agent |
|---|---|---|
| `POST` | `/api/sales/cold-outreach` | Cold Outreach Architect |
| `POST` | `/api/sales/churn-predictor` | Churn Predictor |
| `POST` | `/api/hr/resume-screener` | Resume Screener (PDF upload) |
| `POST` | `/api/finance/intel` | Market Intel Agent |
| `POST` | `/api/support/auto-responder` | Auto Responder |
| `POST` | `/api/media/content-repurposer` | Content Repurposer |

> Full interactive API docs available at `/docs` (Swagger UI auto-generated by FastAPI).

---

## ☁️ Deployment

### Backend → Render.com

1. Push your `ai-engine/` folder to GitHub
2. Create a new **Web Service** on Render
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env` in the Render dashboard
6. Deploy — Render will auto-deploy on every push to `main`

### Frontend → Vercel

1. Push your `web-app/` folder to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `web-app`
4. Add all environment variables from `.env.local` in Vercel dashboard
5. Deploy — Vercel auto-deploys on every push

> **CORS Note:** After deploying the backend, update the `allow_origins` in `main.py` to include your Vercel URL, or keep `["*"]` for development.

---

## 🧩 What I Learned

Building AgenticForge as a 3rd-year CS student taught me things no classroom covers:

**Agentic AI Patterns**
- The difference between a chatbot and an agent — function calling, tool dispatch, autonomous decision-making
- Why `enable_automatic_function_calling=True` is powerful but requires careful system prompt engineering
- How to use Pydantic schemas to enforce structured JSON output from LLMs (eliminating unreliable regex parsing)

**RAG Pipelines in Production**
- How to vectorize documents, store embeddings in Pinecone, and retrieve semantically relevant chunks at query time
- Why a pre-filter before Gemini calls saves significant API quota (the `is_spam_or_promo()` pattern)
- How dynamic prompts (lead context + RAG chunks + state) change AI behavior significantly

**Full-Stack Architecture**
- Running background threads (`threading.Thread`) inside a FastAPI app for real-time inbox monitoring
- FastAPI's `BackgroundTasks` for non-blocking email sends
- How `RealDictCursor` in psycopg2 eliminates index-based row access bugs
- Why serverless databases (Neon) pair better with stateless cloud functions than traditional Postgres

**Multi-Channel Systems**
- Twilio's TwiML response format for WhatsApp webhooks
- How Vapi.ai's architecture differs from Gemini function calling — Vapi handles NLU, your backend only handles tool execution
- IST timezone handling and why code-level guards are more reliable than prompt-level instructions

---

## 👨‍💻 Author

**Siddhant Pathak** — B.Tech Student

Built this to explore what production-grade agentic AI actually looks like beyond tutorials and toy demos.

[![GitHub](https://img.shields.io/badge/GitHub-your--username-181717?style=flat-square&logo=github)](https://github.com/PathakSiddhant)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/siddhant-pathak-380a5b31a/)


---

<div align="center">

**If this project helped you learn something, drop a ⭐ on GitHub.**

*Built with curiosity, caffeine, and a lot of Gemini API calls.*

</div>
