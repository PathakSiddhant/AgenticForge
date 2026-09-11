# AgenticForge

## What it is

AgenticForge is a platform of specialized AI agents, organized two ways:

1. **A marketplace of ~29 single-purpose agents** across eight business
   categories (Finance, HR, Education, Sales, Support, Logistics, Media,
   Travel) plus a developer sandbox. Each agent takes a focused input and
   returns a structured, useful output in one shot (market intel reports,
   resume screening, cold outreach copy, inventory forecasts, and so on).
2. **Two flagship enterprise workflow products** built on the same
   platform, each a complete, stateful application in its own right:
   - **LeadForge** - an AI SDR / CRM. Captures inbound leads, scores and
     routes them with Gemini, nurtures them via a RAG-backed email/chat
     assistant, schedules meetings, and produces executive reporting
     (Excel export, AI-written memos).
   - **MediForge** - an AI hospital receptionist. Books, reschedules, and
     cancels appointments across doctors/specialties through a web chat
     widget, WhatsApp (Twilio), and live voice calls (Vapi), with PDF
     confirmations and capacity-aware scheduling.

## Audience

- **Marketplace agents & landing page:** technical and business buyers
  evaluating AI automation tooling - developers, founders, ops leads
  doing due diligence before committing to a workflow product.
- **LeadForge / MediForge:** the actual day-to-day operators once
  adopted - sales reps and managers (LeadForge), front-desk/reception
  staff (MediForge). These are working tools used for hours at a time,
  not marketing surfaces.

## Register

Split by surface:
- **Brand register** (design IS the product): landing page, auth.
  First impression, has to read as a serious, premium product on
  first glance.
- **Product register** (design SERVES the product): app shell,
  dashboard, agent pages, LeadForge, MediForge. Earned familiarity -
  should feel as trustworthy and fast as Linear/Notion/Raycast/Stripe
  to someone using it daily.

## Current state (as of this overhaul)

- Backend: FastAPI (`ai-engine/`), Gemini (mixed old/new SDK), Neon
  Postgres via psycopg2, Pinecone for RAG, Twilio (WhatsApp), Vapi
  (voice).
- Frontend: Next.js 16 / React 19 / Tailwind v4 (`web-app/`), Clerk
  auth, Drizzle ORM.
- LeadForge and MediForge both have solid, working domain logic
  (scoring, scheduling, multi-channel AI). The gap is entirely in
  product polish: emoji-as-icons, native browser alert()/confirm(),
  hardcoded backend URLs, inconsistent error handling, no shared
  design system, and a "Discover Agents" page that only surfaces 8 of
  29 agents.
- This overhaul's job: build one coherent design system and apply it
  across every surface, fix the underlying product bugs found along
  the way, without discarding the working domain logic underneath.
