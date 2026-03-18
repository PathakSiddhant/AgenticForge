# Path: ai-engine/main.py
import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Request, Form, Response, HTTPException # 🌟 NAYA: Added HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional # 🌟 NAYA: Added Optional for LeadForge models

# Import Local Modules
from db import get_db_connection

load_dotenv()

# ==========================================
# 🤖 MICRO-AGENTS IMPORTS
# ==========================================
# Agents (Base)
from agents import data_structurer
from agents import memory_bot
from agents import tool_caller
from agents import document_reader

# Agents (Finance)
from agents import market_intel
from agents import portfolio_risk
from agents import earnings_rag

# Agents (HR)
from agents import resume_screener
from agents import interview_planner
from agents import onboarding_rag

# Agents (Education and Research)
from agents import research_analyzer
from agents import edu_planner
from agents import essay_evaluator

# Agents (Sales & Marketing)
from agents import cold_outreach
from agents import seo_analyzer
from agents import churn_predictor

# Agents (Customer Support)
from agents import ticket_router
from agents import auto_responder
from agents import refund_automator

# Agents (Logistics & Supply Chain)
from agents import inventory_forecaster
from agents import supplier_risk
from agents import freight_optimizer

# Agents (Media & Content Agency)
from agents import viral_hook_generator
from agents import raw_scriptwriter
from agents import content_repurposer

# Agents (Travel & Event Management)
from agents import itinerary_planner
from agents import vendor_negotiator
from agents import crisis_manager

# Enterprise Workflow (MediForge)
from agents.mediforge_receptionist import MediForgeReceptionist
from twilio.twiml.messaging_response import MessagingResponse

# 🌟 ENTERPRISE WORKFLOW (LEADFORGE AI BRAIN)
from agents.lead_scorer import score_lead_with_ai


# ==========================================
# 🚀 APP INITIALIZATION & CORS
# ==========================================
app = FastAPI(title="AgenticForge API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 📂 HOST STATIC FILES (FOR PDF DOWNLOADS)
# ==========================================
os.makedirs("static", exist_ok=True) # Agar folder nahi hai toh bana dega
app.mount("/static", StaticFiles(directory="static"), name="static")


# ==========================================
# 🔗 MICRO-AGENTS ROUTING
# ==========================================
# Routing Base
app.include_router(data_structurer.router)
app.include_router(memory_bot.router)
app.include_router(tool_caller.router)
app.include_router(document_reader.router)

# Routing Finance
app.include_router(market_intel.router)
app.include_router(portfolio_risk.router)
app.include_router(earnings_rag.router)

# Routing HR
app.include_router(resume_screener.router)
app.include_router(interview_planner.router)
app.include_router(onboarding_rag.router)

# Routing Edu-Research
app.include_router(research_analyzer.router)
app.include_router(edu_planner.router)
app.include_router(essay_evaluator.router)

# Routing Sales
app.include_router(cold_outreach.router)
app.include_router(seo_analyzer.router)
app.include_router(churn_predictor.router)

# Routing Support
app.include_router(ticket_router.router)
app.include_router(auto_responder.router)
app.include_router(refund_automator.router)

# Routing Logistics
app.include_router(inventory_forecaster.router)
app.include_router(supplier_risk.router)
app.include_router(freight_optimizer.router)

# Routing Media
app.include_router(viral_hook_generator.router)
app.include_router(raw_scriptwriter.router)
app.include_router(content_repurposer.router)

# Routing Travel
app.include_router(itinerary_planner.router)
app.include_router(vendor_negotiator.router)
app.include_router(crisis_manager.router)

@app.get("/")
def health_check():
    return {"status": "AI Engine is running perfectly!"}


# ==========================================
# 🌟 ENTERPRISE WORKFLOWS: MEDIFORGE ENDPOINTS
# ==========================================

# 1. Initialize Global Agent (Preserves Chat History)
receptionist_agent = MediForgeReceptionist()

# 2. Pydantic Models for Input Validation
class ChatRequest(BaseModel):
    message: str

class ManualBooking(BaseModel):
    patient_name: str
    patient_phone: str
    doctor_id: int
    date: str  # Format: YYYY-MM-DD
    time: str  # Format: HH:MM AM/PM
    status: str = "Scheduled"
    notes: str

# 3. Endpoint: AI Chat Simulator
@app.post("/api/mediforge/chat")
async def mediforge_chat(request: ChatRequest):
    """Handles messages from the AI Agent widget"""
    ai_reply = receptionist_agent.chat(request.message)
    return {"reply": ai_reply}

# 4. Endpoint: Fetch Live Appointments for Dashboard
@app.get("/api/mediforge/appointments")
def get_live_appointments():
    """Fetches real appointments from Neon DB for the Dashboard Grid/Calendar"""
    conn = get_db_connection()
    if not conn: return []
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT a.id, a.patient_name as patient, a.patient_phone as phone, 
                   a.doctor_id, d.name as doctor, a.appointment_date, a.status, a.notes 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            ORDER BY a.appointment_date ASC
        """)
        appointments = cur.fetchall()
        
        # Convert datetime to string for frontend visualization
        for appt in appointments:
            if appt['appointment_date']:
                appt['time'] = appt['appointment_date'].strftime("%I:%M %p")
                appt['date'] = appt['appointment_date'].strftime("%Y-%m-%d")
                
        return appointments
    except Exception as e:
        print(f"Error fetching DB: {e}")
        return []
    finally:
        conn.close()

# 5. Endpoint: Manual Walk-in Booking (CREATE)
@app.post("/api/mediforge/appointments/manual")
def create_manual_appointment(booking: ManualBooking):
    conn = get_db_connection()
    if not conn: return {"status": "error", "message": "DB Connection Failed"}
    
    try:
        cur = conn.cursor()
        full_datetime = f"{booking.date} {booking.time}"
        
        cur.execute("""
            SELECT COUNT(*) as current_bookings FROM appointments 
            WHERE doctor_id = %s AND appointment_date = %s::timestamp AND status != 'Cancelled'
        """, (booking.doctor_id, full_datetime))
        
        if cur.fetchone()['current_bookings'] >= 2:
            return {"status": "error", "message": "LIMIT REACHED: This doctor already has 2 patients in this slot. Please select another time."}

        cur.execute("""
            INSERT INTO appointments (patient_name, patient_phone, doctor_id, appointment_date, status, notes)
            VALUES (%s, %s, %s, %s::timestamp, %s, %s) RETURNING id
        """, (booking.patient_name, booking.patient_phone, booking.doctor_id, full_datetime, booking.status, booking.notes))
        
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"DB Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

# 6. ENDPOINT: EDIT APPOINTMENT (UPDATE)
@app.put("/api/mediforge/appointments/{apt_id}")
def update_appointment(apt_id: int, booking: ManualBooking):
    conn = get_db_connection()
    if not conn: return {"status": "error", "message": "DB Connection Failed"}
    try:
        cur = conn.cursor()
        full_datetime = f"{booking.date} {booking.time}"
        
        cur.execute("""
            SELECT COUNT(*) as current_bookings FROM appointments 
            WHERE doctor_id = %s AND appointment_date = %s::timestamp AND id != %s AND status != 'Cancelled'
        """, (booking.doctor_id, full_datetime, apt_id))
        
        if cur.fetchone()['current_bookings'] >= 2:
            return {"status": "error", "message": "LIMIT REACHED: Cannot move to this slot. Doctor already has 2 patients here."}

        cur.execute("""
            UPDATE appointments 
            SET patient_name=%s, patient_phone=%s, doctor_id=%s, appointment_date=%s::timestamp, status=%s, notes=%s
            WHERE id=%s
        """, (booking.patient_name, booking.patient_phone, booking.doctor_id, full_datetime, booking.status, booking.notes, apt_id))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"DB Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

# 7. ENDPOINT: DELETE APPOINTMENT (REMOVE)
@app.delete("/api/mediforge/appointments/{apt_id}")
def delete_appointment(apt_id: int):
    conn = get_db_connection()
    if not conn: return {"status": "error", "message": "DB Connection Failed"}
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM appointments WHERE id=%s", (apt_id,))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"DB Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

# 8. Endpoint: Fetch all Doctors for the Dropdown
@app.get("/api/mediforge/doctors")
def get_doctors():
    conn = get_db_connection()
    if not conn: return []
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, specialty FROM doctors ORDER BY specialty, name")
        return cur.fetchall()
    except Exception as e:
        return []
    finally:
        conn.close()
        
# 9. ENDPOINT: THE WHATSAPP WEBHOOK (TWILIO)
@app.post("/api/whatsapp")
async def whatsapp_webhook(Body: str = Form(...), From: str = Form(...)):
    print(f"\n📱 [WHATSAPP MSG] From {From}: {Body}")
    try:
        ai_reply = receptionist_agent.chat(Body)
        twiml_response = MessagingResponse()
        twiml_response.message(ai_reply)
        return Response(content=str(twiml_response), media_type="application/xml")
    except Exception as e:
        print(f"❌ WhatsApp Webhook Error: {e}")
        error_msg = MessagingResponse()
        error_msg.message("Sorry, our AI system is currently offline. Please try again later.")
        return Response(content=str(error_msg), media_type="application/xml")
    
# 10. THE FINAL BOSS: VAPI.AI VOICE WEBHOOK
import json

@app.post("/api/vapi/webhook")
async def vapi_webhook(request: Request):
    try:
        payload = await request.json()
        message = payload.get("message", {})

        if message.get("type") == "tool-calls":
            results = []
            from agents.mediforge_receptionist import check_availability, book_appointment, lookup_appointment, cancel_appointment

            for tool_call in message.get("toolCalls", []):
                function_name = tool_call.get("function", {}).get("name")
                raw_arguments = tool_call.get("function", {}).get("arguments", "{}")
                
                if isinstance(raw_arguments, str):
                    arguments = json.loads(raw_arguments)
                else:
                    arguments = raw_arguments

                call_id = tool_call.get("id")
                print(f"\n📞 [VOICE AI ACTION] Calling {function_name} with: {arguments}")
                result_str = ""
                
                if function_name == "check_availability":
                    result_str = check_availability(arguments.get("specialty_category"), arguments.get("target_date"))
                elif function_name == "book_appointment":
                    symptoms = arguments.get("symptoms", "Voice Consultation")
                    result_str = book_appointment(
                        arguments.get("patient_name"), arguments.get("patient_phone"), 
                        arguments.get("specialty_category"), arguments.get("appointment_date"), 
                        arguments.get("appointment_time"), symptoms
                    )
                elif function_name == "lookup_appointment":
                    result_str = lookup_appointment(arguments.get("patient_phone"))
                elif function_name == "cancel_appointment":
                    result_str = cancel_appointment(arguments.get("patient_phone"))
                else:
                    result_str = "Error: Unknown tool."

                results.append({"toolCallId": call_id, "result": result_str})
            return {"results": results}
        return {"status": "ignored message type"}
    except Exception as e:
        print(f"❌ Voice Webhook Error: {e}")
        return {"error": str(e)}


# ==========================================
# 🚀 ENTERPRISE WORKFLOWS: LEADFORGE ENDPOINTS
# ==========================================

# 1. Pydantic Model for LeadForge
class LeadCreate(BaseModel):
    name: str
    email: str
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    pain_point: Optional[str] = None
    source: Optional[str] = "Website Form"

# 2. Endpoint: Save Lead (Now with AI Enrichment!)
@app.post("/api/leads/submit")
def submit_lead(lead: LeadCreate):
    print(f"📥 [LeadForge] New lead received from: {lead.name} ({lead.email})")
    
    # 🌟 1. Call the AI Brain to score the lead first!
    lead_dict = lead.model_dump()
    ai_analysis = score_lead_with_ai(lead_dict)
    
    score = ai_analysis.get("score", 0)
    status = ai_analysis.get("status", "New")
    reasoning = ai_analysis.get("reasoning", "No reasoning provided.")
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cur = conn.cursor()
        # 🌟 2. Save everything including AI Score to the DB
        cur.execute("""
            INSERT INTO leads (name, email, company_name, company_size, budget, timeline, pain_point, source, ai_score, lead_status, ai_reasoning)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (
            lead.name, lead.email, lead.company_name, lead.company_size, 
            lead.budget, lead.timeline, lead.pain_point, lead.source,
            score, status, reasoning
        ))
        
        new_lead_id = cur.fetchone()['id']
        conn.commit()
        
        return {
            "success": True, 
            "message": "Lead scored and captured successfully!", 
            "lead_id": new_lead_id,
            "ai_score": score,
            "status": status
        }
    except Exception as e:
        conn.rollback()
        print(f"❌ [LeadForge] Error: {e}")
        raise HTTPException(status_code=400, detail="Error saving lead. Maybe email already exists?")
    finally:
        conn.close()