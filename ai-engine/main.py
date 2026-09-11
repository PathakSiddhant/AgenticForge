# Path: ai-engine/main.py
import os
import json
import uuid
import datetime
import random 
import string 
import threading  # 🌟 NEW: Added for Background Thread
import time       # 🌟 NEW: Added for Time delays
import io         # 🌟 NEW: Added for Excel Export
import pandas as pd # 🌟 NEW: Added for Excel Export
import google.generativeai as genai 
from pinecone import Pinecone 
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Request, Form, Response, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, PlainTextResponse # 🌟 NEW: Added for Excel & Memo Export
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional 

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
from services.email_sender import send_confirmation_email, send_meeting_confirmation_email
from services.email_listener import check_inbox  # 🌟 NEW: Added for Email Polling


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
# 🎧 BACKGROUND DAEMON (EMAIL LISTENER & DB SWEEPER)
# ==========================================
def clean_past_meetings():
    """Soft-deletes past meetings by changing their lead status, preserving data for Analytics"""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            # 🌟 NAYA LOGIC: Delete mat karo, bas status 'Completed Meeting' kardo
            cur.execute("""
                UPDATE leads 
                SET lead_status = 'Completed Meeting' 
                WHERE id IN (
                    SELECT lead_id FROM meetings WHERE meeting_date < CURRENT_DATE
                ) AND lead_status = 'Meeting Scheduled'
            """)
            conn.commit()
        except Exception as e:
            print(f"⚠️ DB Cleanup Error: {e}")
        finally:
            conn.close()

def start_background_tasks():
    print("🎧 [Background Worker] Started. Monitoring emails & sweeping old meetings...")
    while True:
        try:
            clean_past_meetings() # 🌟 NAYA: Auto-update past meetings (Soft Delete)
            check_inbox()         # Email check
        except Exception as e:
            print(f"⚠️ Background Task Error: {e}")
        time.sleep(15)  # Run every 15 seconds

@app.on_event("startup")
def startup_event():
    listener_thread = threading.Thread(target=start_background_tasks, daemon=True)
    listener_thread.start()


# ==========================================
# 📂 HOST STATIC FILES (FOR PDF DOWNLOADS)
# ==========================================
os.makedirs("static", exist_ok=True) 
app.mount("/static", StaticFiles(directory="static"), name="static")

# 🌟 LINK GENERATOR (Moved up so all endpoints can use it)
def generate_meet_link():
    """Generates a realistic Google Meet link format (abc-defg-hij)"""
    def r(n): return ''.join(random.choices(string.ascii_lowercase, k=n))
    return f"https://meet.google.com/{r(3)}-{r(4)}-{r(3)}"


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

class LeadUpdate(BaseModel):
    name: str
    email: str
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    pain_point: Optional[str] = None
    lead_status: Optional[str] = None 

# 🌟 NAYA: Manual Meeting Request Model
class ManualMeetingRequest(BaseModel):
    lead_id: int
    date: str
    time: str

# 2. Endpoint: Save Lead
@app.post("/api/leads/submit")
def submit_lead(lead: LeadCreate, background_tasks: BackgroundTasks): 
    print(f"📥 [LeadForge] New lead received from: {lead.name} ({lead.email})")
    
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

        background_tasks.add_task(
            send_confirmation_email,
            lead_id=new_lead_id, 
            lead_name=lead.name,
            lead_email=lead.email,
            ai_status=status,
            budget=lead.budget,
            timeline=lead.timeline,
            pain=lead.pain_point
        )
        
        return {
            "success": True, 
            "message": "Lead scored, captured, and emailed successfully!", 
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

# 3. Endpoint: Fetch All Leads for Dashboard
@app.get("/api/leads")
def get_all_leads():
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, email, company_name as company, company_size, ai_score as score, 
                   lead_status as status, budget, timeline, pain_point as pain, ai_reasoning 
            FROM leads 
            ORDER BY created_at DESC
        """)
        leads = cur.fetchall()
        return leads
    except Exception as e:
        print(f"❌ [LeadForge] Error fetching leads: {e}")
        return []
    finally:
        conn.close()

# 4. Endpoint to Update (Edit) a Lead
@app.put("/api/leads/{lead_id}")
def update_lead(lead_id: int, lead: LeadUpdate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE leads 
            SET name=%s, email=%s, company_name=%s, company_size=%s, budget=%s, timeline=%s, pain_point=%s, lead_status=%s
            WHERE id=%s
        """, (lead.name, lead.email, lead.company_name, lead.company_size, lead.budget, lead.timeline, lead.pain_point, lead.lead_status, lead_id))
        conn.commit()
        return {"success": True, "message": "Lead updated successfully!"}
    except Exception as e:
        conn.rollback()
        print(f"❌ [LeadForge] Error updating lead: {e}")
        raise HTTPException(status_code=400, detail="Error updating lead")
    finally:
        conn.close()

# 5. Endpoint: Delete Lead
@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM leads WHERE id = %s", (lead_id,))
        conn.commit()
        return {"success": True, "message": "Lead deleted"}
    except Exception as e:
        conn.rollback()
        print(f"❌ [LeadForge] Error deleting lead: {e}")
        raise HTTPException(status_code=400, detail="Error deleting lead")
    finally:
        conn.close()

# 🌟 NAYA: 1. ENDPOINT: Manual Booking from Dashboard
@app.post("/api/leads/schedule-manual")
def schedule_manual_meeting(req: ManualMeetingRequest):
    meet_link = generate_meet_link() 
    
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Error")
    try:
        cur = conn.cursor()
        
        # Lead ki details nikal rahe hain email bhejne ke liye
        cur.execute("SELECT name, email FROM leads WHERE id = %s", (req.lead_id,))
        lead_data = cur.fetchone()
        if not lead_data: return {"success": False, "message": "Lead not found"}
        
        lead_name = lead_data.get('name', '') if isinstance(lead_data, dict) else lead_data[0]
        lead_email = lead_data.get('email', '') if isinstance(lead_data, dict) else lead_data[1]

        # Meetings table mein entry
        cur.execute("""
            INSERT INTO meetings (lead_id, meeting_date, meeting_time, meet_link, notes)
            VALUES (%s, %s, %s, %s, %s)
        """, (req.lead_id, req.date, req.time, meet_link, "Manually Scheduled from Dashboard"))
        
        # Leads table mein status update (taki wo Kanban pipeline se hat jaye)
        cur.execute("UPDATE leads SET lead_status = 'Meeting Scheduled' WHERE id = %s", (req.lead_id,))
        conn.commit()

        # 🌟 SAME OFFICIAL EMAIL BHEJ RAHE HAIN
        send_meeting_confirmation_email(lead_name, lead_email, req.date, req.time, meet_link)
        
        return {"success": True, "message": "Meeting Scheduled & Email Sent!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

# 🌟 UPDATED: Fetch Scheduled Meetings for Dashboard Calendar
@app.get("/api/leads/meetings")
def get_lead_meetings():
    conn = get_db_connection()
    if not conn: return []
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT m.id as meeting_id, m.lead_id, l.name, l.email, l.company_name, 
                   l.company_size, l.budget, l.timeline, l.pain_point, l.ai_score,
                   m.meeting_date, m.meeting_time, m.meet_link 
            FROM meetings m
            JOIN leads l ON m.lead_id = l.id
            ORDER BY m.meeting_date ASC, m.meeting_time ASC
        """)
        
        meetings_data = cur.fetchall()
        result = []
        
        for row in meetings_data:
            # 🌟 MAGIC FIX: Agar DB directly dictionary bhej raha hai
            if isinstance(row, dict):
                result.append(row)
            # Agar DB tuple bhej raha hai, tab zip karo
            else:
                columns = [desc[0] for desc in cur.description]
                result.append(dict(zip(columns, row)))
                
        return result
        
    except Exception as e:
        print(f"Error fetching meetings: {e}")
        return []
    finally:
        conn.close()

# 🌟 NAYA: 3. ENDPOINT: Mark as Complete (Dono Table se Delete!)
@app.delete("/api/leads/meetings/{lead_id}/complete")
def complete_meeting(lead_id: int):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Error")
    try:
        cur = conn.cursor()
        # Meetings table se hataya
        cur.execute("DELETE FROM meetings WHERE lead_id = %s", (lead_id,))
        # Leads table se hataya (Jaisa tune bola, pura kachra saaf)
        cur.execute("DELETE FROM leads WHERE id = %s", (lead_id,))
        conn.commit()
        return {"success": True, "message": "Lead & Meeting removed successfully."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


# 🌟 NAYA: EXCEL EXPORT (100% Data Fix + Power BI Engine)
@app.get("/api/export/excel")
def export_leads_excel(start_date: str, end_date: str):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Error")
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT name, email, company_name, company_size, budget, timeline, pain_point, ai_score, lead_status, created_at 
            FROM leads 
            WHERE DATE(created_at) >= %s AND DATE(created_at) <= %s
            ORDER BY ai_score DESC
        """, (start_date, end_date))
        
        rows = cur.fetchall()
        
        if not rows:
            raise HTTPException(status_code=404, detail="No leads found in this date range.")

        # 🌟 THE REAL BUG FIX: Smartly loading data from DB!
        columns = [desc[0] for desc in cur.description]
        if hasattr(rows[0], 'keys') or isinstance(rows[0], dict):
            # Agar DB dictionary bhej raha hai (Jo tera issue tha)
            df = pd.DataFrame([dict(r) for r in rows])
        else:
            # Agar DB tuple bhej raha hai
            df = pd.DataFrame(rows, columns=columns)
        
        # 2. Convert Dates safely
        if 'created_at' in df.columns:
            df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce').dt.strftime('%Y-%m-%d %H:%M')
        df.fillna("N/A", inplace=True)

        # 3. Categorize
        df_hot = df[df['lead_status'] == 'Hot']
        df_warm = df[df['lead_status'] == 'Warm']
        df_cold = df[df['lead_status'] == 'Cold']
        df_meetings = df[df['lead_status'].isin(['Meeting Scheduled', 'Completed Meeting'])]

        # 4. Analytics
        status_counts = df['lead_status'].value_counts().reset_index()
        status_counts.columns = ['Status', 'Count']
        
        budget_counts = df['budget'].value_counts().reset_index()
        budget_counts.columns = ['Budget', 'Count']

        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            workbook = writer.book
            
            # --- STYLES ---
            title_fmt = workbook.add_format({'bold': True, 'font_size': 24, 'font_color': '#0F172A'})
            kpi_title = workbook.add_format({'bold': True, 'font_size': 12, 'font_color': '#64748B', 'align': 'center'})
            kpi_val = workbook.add_format({'bold': True, 'font_size': 28, 'font_color': '#2563EB', 'align': 'center', 'border': 1, 'bg_color': '#F8FAFC'})
            header_fmt = workbook.add_format({'bold': True, 'bg_color': '#1E3A8A', 'font_color': 'white', 'border': 1})

            # --- SHEET 1: Executive Dashboard ---
            ws_dash = workbook.add_worksheet('Executive Dashboard')
            ws_dash.hide_gridlines(2)
            ws_dash.write('B2', f'LeadForge Enterprise Analytics ({start_date} to {end_date})', title_fmt)
            
            ws_dash.write('B4', 'TOTAL LEADS', kpi_title)
            ws_dash.write('B5', len(df), kpi_val)
            ws_dash.write('D4', 'HOT LEADS', kpi_title)
            ws_dash.write('D5', len(df_hot), kpi_val)
            ws_dash.write('F4', 'MEETINGS', kpi_title)
            ws_dash.write('F5', len(df_meetings), kpi_val)
            ws_dash.write('H4', 'CONVERSION %', kpi_title)
            conversion = round((len(df_meetings) / len(df)) * 100) if len(df) > 0 else 0
            ws_dash.write('H5', f"{conversion}%", kpi_val)

            # --- SHEET 2: Analytics Data ---
            status_counts.to_excel(writer, sheet_name='Analytics Data', index=False, startcol=0)
            budget_counts.to_excel(writer, sheet_name='Analytics Data', index=False, startcol=3)
            
            pie_chart = workbook.add_chart({'type': 'pie'})
            pie_chart.add_series({
                'name': 'Pipeline Status',
                'categories': ['Analytics Data', 1, 0, len(status_counts), 0],
                'values':     ['Analytics Data', 1, 1, len(status_counts), 1],
                'data_labels': {'percentage': True}
            })
            pie_chart.set_title({'name': 'Lead Status Distribution'})
            pie_chart.set_size({'width': 350, 'height': 250})
            ws_dash.insert_chart('B8', pie_chart)

            bar_chart = workbook.add_chart({'type': 'column'})
            bar_chart.add_series({
                'name': 'Budget Distribution',
                'categories': ['Analytics Data', 1, 3, len(budget_counts), 3],
                'values':     ['Analytics Data', 1, 4, len(budget_counts), 4],
                'fill': {'color': '#10B981'}
            })
            bar_chart.set_title({'name': 'Revenue Potential'})
            bar_chart.set_size({'width': 350, 'height': 250})
            bar_chart.set_legend({'position': 'none'})
            ws_dash.insert_chart('F8', bar_chart)

            # --- Native Formatting Function ---
            def write_safe_sheet(data_df, sheet_name):
                if data_df.empty:
                    ws = workbook.add_worksheet(sheet_name)
                    ws.write('A1', 'No data available for this category.')
                    return
                
                clean_cols = [str(c).replace('_', ' ').title() for c in data_df.columns]
                data_df.columns = clean_cols
                data_df.to_excel(writer, sheet_name=sheet_name, index=False)
                
                ws = writer.sheets[sheet_name]
                max_row, max_col = data_df.shape
                
                ws.autofilter(0, 0, max_row, max_col - 1)
                ws.set_column(0, max_col - 1, 20)
                for col_num, col_name in enumerate(clean_cols):
                    ws.write(0, col_num, col_name, header_fmt)

            # --- Write Sheets ---
            write_safe_sheet(df, 'Master Pipeline')
            write_safe_sheet(df_hot, 'Hot Leads')
            write_safe_sheet(df_warm, 'Warm Leads')
            write_safe_sheet(df_cold, 'Cold Leads')
            write_safe_sheet(df_meetings, 'Scheduled Meetings')

        output.seek(0)
        file_bytes = output.read()
        
        # 🌟 NAYA: File ke naam mein automatically dates aayengi!
        filename = f"LeadForge_Analytics_{start_date}_to_{end_date}.xlsx"
        headers = {'Content-Disposition': f'attachment; filename="{filename}"'}
        
        return Response(
            content=file_bytes, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            headers=headers
        )
        
    except Exception as e:
        print(f"❌ Excel Export Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# 🤖 NAYA: AI EXECUTIVE MEMO EXPORT (Gemini powered Business Intelligence)
@app.get("/api/export/ai-memo")
def export_ai_memo(start_date: str, end_date: str):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Error")
    
    try:
        cur = conn.cursor()
        # Dates ke hisaab se data nikalna
        cur.execute("""
            SELECT name, company_name, budget, pain_point, lead_status 
            FROM leads 
            WHERE DATE(created_at) >= %s AND DATE(created_at) <= %s
        """, (start_date, end_date))
        
        columns = [desc[0] for desc in cur.description]
        leads_data = [dict(zip(columns, row)) for row in cur.fetchall()]
        
        if not leads_data:
            raise HTTPException(status_code=404, detail="No leads found to analyze.")

        # Data ko summarize karna Gemini ke liye (Tokens bachane ke liye)
        total_leads = len(leads_data)
        hot_leads = [l for l in leads_data if l['lead_status'] == 'Hot']
        
        data_summary = f"Total Leads Captured: {total_leads}\nHot Leads (Ready to close): {len(hot_leads)}\n\n"
        data_summary += "Details of Hot Leads:\n"
        for l in hot_leads:
            data_summary += f"- {l['name']} from {l['company_name']} (Budget: {l['budget']}). Pain Point: {l['pain_point']}\n"
        
        # The Master Prompt for the CEO
        prompt = f"""
        You are an elite Business Analyst for 'LeadForge CRM'.
        Analyze the following lead data collected from {start_date} to {end_date}.
        
        DATA:
        {data_summary}
        
        Write a highly professional, 1-page Executive Summary Memo addressed to the Management Team.
        Include:
        1. A brief overview of the lead volume and pipeline health.
        2. Key pain points observed from the Hot Leads.
        3. Strategic recommendations on how the sales team should approach closing these specific Hot Leads.
        
        Format it professionally using Markdown headers, bullet points, and bold text. Keep it concise, actionable, and data-driven. Do not include placeholder text.
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        memo_text = response.text
        
        # File ko directly Markdown (.md) format mein download karwana
        filename = f"AI_Executive_Memo_{start_date}_to_{end_date}.md"
        headers = {'Content-Disposition': f'attachment; filename="{filename}"'}
        
        return PlainTextResponse(memo_text, headers=headers, media_type="text/markdown")
        
    except Exception as e:
        print(f"❌ AI Memo Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ==========================================
# 🤖 THE NEW CHATBOT BACKEND ENGINE (SELF-AWARE RAG)
# ==========================================

# 🌟 INITIALIZE PINECONE IN API
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY", "DUMMY_KEY"))
index = pc.Index("agenticforge-index")

class SDRChatRequest(BaseModel):
    lead_id: int
    message: str
    history: list = [] 

def get_query_embedding(text):
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_query", 
    )
    return result['embedding'][:768] 


@app.post("/api/chat/book")
def chat_with_sdr(req: SDRChatRequest):
    print(f"💬 [Chat Engine] Message from Lead {req.lead_id}: {req.message}")

    # 1. DB Context Setup
    lead_name, lead_email, lead_context = "User", "", "No specific needs."
    existing_meeting = None
    booked_times_str = "No existing meetings."
    
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            
            # Lead Info (Safely handling DictCursor)
            cur.execute("SELECT name, email, pain_point FROM leads WHERE id = %s", (req.lead_id,))
            lead_data = cur.fetchone()
            if lead_data:
                lead_name = lead_data.get('name', '') if isinstance(lead_data, dict) else lead_data[0]
                lead_email = lead_data.get('email', '') if isinstance(lead_data, dict) else lead_data[1]
                needs = lead_data.get('pain_point', '') if isinstance(lead_data, dict) else lead_data[2]
                lead_context = f"Name: {lead_name}\nSpecific Needs: {needs}"

            # 🌟 NAYA: Check if THIS specific lead already has a meeting booked
            cur.execute("SELECT meeting_date, meeting_time, meet_link FROM meetings WHERE lead_id = %s AND meeting_date >= CURRENT_DATE", (req.lead_id,))
            existing_meeting = cur.fetchone()

            # All booked meetings (for conflict check)
            cur.execute("SELECT meeting_date, meeting_time FROM meetings WHERE meeting_date >= CURRENT_DATE")
            booked_meetings = cur.fetchall()
            if booked_meetings:
                times = []
                for m in booked_meetings:
                    m_date = m.get('meeting_date') if isinstance(m, dict) else m[0]
                    m_time = m.get('meeting_time') if isinstance(m, dict) else m[1]
                    times.append(f"{m_date} at {m_time}")
                booked_times_str = ", ".join(times)
                
            conn.close()
    except Exception as e:
        print(f"⚠️ DB Context Error: {e}")

    # 2. RAG Search
    try:
        query_vector = get_query_embedding(req.message)
        search_results = index.query(vector=query_vector, top_k=2, include_metadata=True)
        retrieved_context = "\n".join([f"- {m['metadata'].get('text', '')}" for m in search_results.get('matches', [])])
    except Exception as e:
        print(f"❌ [Pinecone Search Error]: {e}")
        retrieved_context = "No specific company knowledge could be retrieved at this moment."

    # 🌟 3. DYNAMIC PROMPT (The "Memory" & "Past Date Restriction" Fix)
    current_date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    
    if existing_meeting:
        ex_date = existing_meeting.get('meeting_date') if isinstance(existing_meeting, dict) else existing_meeting[0]
        ex_time = existing_meeting.get('meeting_time') if isinstance(existing_meeting, dict) else existing_meeting[1]
        ex_link = existing_meeting.get('meet_link') if isinstance(existing_meeting, dict) else existing_meeting[2]

        meeting_status_prompt = f"""
        CRITICAL STATUS: You have ALREADY scheduled a meeting with this user for {ex_date} at {ex_time}.
        The meeting link is {ex_link}.
        ALREADY BOOKED TIMES: {booked_times_str} (Do NOT allow rescheduling at these times).
        
        RULES:
        1. DO NOT ask them to book a NEW call. Acknowledge their existing meeting.
        2. IF the user asks to RESCHEDULE, ask them for a new date and time.
        3. CRITICAL: Today is {current_date_str}. You CANNOT schedule meetings in the past. If they give a past date, decline and ask for a future date.
        4. IF the user provides a CLEAR FUTURE DATE AND TIME for rescheduling, YOU MUST OUTPUT STRICT JSON ONLY:
        {{
            "action": "reschedule_meeting",
            "date": "YYYY-MM-DD",
            "time": "HH:MM AM/PM"
        }}
        """
    else:
        meeting_status_prompt = f"""
        CRITICAL STATUS: No meeting scheduled yet. Your ultimate goal is to smoothly pivot the conversation towards booking a 30-minute Architecture Review call.
        ALREADY BOOKED TIMES: {booked_times_str} (Do NOT allow booking at these times).
        RULES:
        1. CRITICAL: Today is {current_date_str}. You CANNOT schedule meetings in the past. If the user asks for a past date, politely decline and ask for a future date.
        2. If the user provides a clear future date and time, YOU MUST OUTPUT STRICT JSON ONLY: {{"action": "book_meeting", "date": "YYYY-MM-DD", "time": "HH:MM AM/PM"}}
        """

    prompt = f"""
    You are the elite Autonomous SDR for AgenticForge. 
    --- LEAD CONTEXT ---
    {lead_context}
    --- KNOWLEDGE BASE ---
    {retrieved_context}
    
    Current Date: {current_date_str}
    {meeting_status_prompt}
    
    User's Message: "{req.message}"
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        ai_reply = response.text.strip()
        
        # Clean JSON backticks
        if ai_reply.startswith("```json"):
            ai_reply = ai_reply.replace("```json", "").replace("```", "").strip()
        elif ai_reply.startswith("```"):
            ai_reply = ai_reply.replace("```", "").strip()
        
        # 🌟 4A. NEW BOOKING LOGIC
        if ai_reply.startswith("{") and "book_meeting" in ai_reply and not existing_meeting:
            booking_data = json.loads(ai_reply)
            meet_link = generate_meet_link()
            
            conn = get_db_connection()
            if conn:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO meetings (lead_id, meeting_date, meeting_time, meet_link, notes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (req.lead_id, booking_data['date'], booking_data['time'], meet_link, "AI Scheduled"))
                
                cur.execute("UPDATE leads SET lead_status = 'Meeting Scheduled' WHERE id = %s", (req.lead_id,))
                conn.commit()
                conn.close()
            
            send_meeting_confirmation_email(lead_name, lead_email, booking_data['date'], booking_data['time'], meet_link)
            
            final_response = f"Perfect! Your architecture review is locked in for {booking_data['date']} at {booking_data['time']}. I've sent a calendar invite to {lead_email}."
            return {"reply": final_response, "is_booked": True, "meet_link": meet_link}

        # 🌟 4B. RESCHEDULE LOGIC (Naya Code)
        elif ai_reply.startswith("{") and "reschedule_meeting" in ai_reply and existing_meeting:
            booking_data = json.loads(ai_reply)
            
            ex_link = existing_meeting.get('meet_link') if isinstance(existing_meeting, dict) else existing_meeting[2]
            meet_link = ex_link 
            
            conn = get_db_connection()
            if conn:
                cur = conn.cursor()
                # 🌟 Update the existing meeting instead of creating a new one!
                cur.execute("""
                    UPDATE meetings 
                    SET meeting_date = %s, meeting_time = %s 
                    WHERE lead_id = %s
                """, (booking_data['date'], booking_data['time'], req.lead_id))
                conn.commit()
                conn.close()
            
            # Send email again
            send_meeting_confirmation_email(lead_name, lead_email, booking_data['date'], booking_data['time'], meet_link)
            
            final_response = f"Got it, {lead_name}. I have successfully rescheduled our meeting to {booking_data['date']} at {booking_data['time']}. I've sent an updated invite to your email."
            return {"reply": final_response, "is_booked": True, "meet_link": meet_link}

        else:
            return {"reply": ai_reply, "is_booked": False}
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"reply": "Sorry, I had a quick glitch. What were we discussing?", "is_booked": False}