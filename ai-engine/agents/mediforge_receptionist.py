# Path: ai-engine/agents/mediforge_receptionist.py
import os
import google.generativeai as genai
from db import get_db_connection
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# 🛠️ TOOL 1: Check Availability
def check_availability(specialty_category: str, target_date: str) -> str:
    """Checks available slots for a specific medical category on a given date (YYYY-MM-DD)."""
    print(f"🔍 [AI TOOL] Checking {specialty_category} slots on {target_date}...")
    conn = get_db_connection()
    if not conn: return "Error connecting to database."
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM doctors WHERE specialty ILIKE %s", (f"%{specialty_category}%",))
        doctors = cur.fetchall()
        if not doctors: return f"We currently do not have a specialist for {specialty_category}."

        doc_ids = tuple([d['id'] for d in doctors])
        standard_slots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]
        available_slots = []

        cur.execute("""
            SELECT TO_CHAR(appointment_date, 'HH12:MI AM') as booked_time 
            FROM appointments 
            WHERE doctor_id IN %s AND DATE(appointment_date) = DATE(%s) AND status != 'Cancelled'
        """, (doc_ids, target_date))
        booked_records = cur.fetchall()
        
        # 🌟 THE TIME FIX: Aaj ki date aur time check karo
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")

        for slot in standard_slots:
            # Agar user aaj ki date check kar raha hai, toh past slots skip kardo
            if target_date == today_str:
                slot_time_obj = datetime.strptime(slot, "%I:%M %p").time()
                if slot_time_obj <= now.time():
                    continue  # Time nikal gaya, skip maar!

            patients_in_this_slot = sum(1 for record in booked_records if record['booked_time'] == slot)
            if patients_in_this_slot < 2:
                available_slots.append(slot)

        if not available_slots: return f"All {specialty_category} slots are completely full on {target_date}."
        return f"Available slots for {specialty_category} on {target_date} are: {', '.join(available_slots)}."
    except Exception as e:
        return f"Database error: {e}"
    finally:
        conn.close()

# 🛠️ TOOL 2: Auto-Assign and Book
def book_appointment(patient_name: str, patient_phone: str, specialty_category: str, appointment_date: str, appointment_time: str, symptoms: str) -> str:
    """Books the appointment. Returns SUCCESS with the assigned doctor's name."""
    print(f"📝 [AI TOOL] Booking {patient_name} for {specialty_category} at {appointment_time}...")
    conn = get_db_connection()
    if not conn: return "Error connecting to database."
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM doctors WHERE specialty ILIKE %s", (f"%{specialty_category}%",))
        doctors = cur.fetchall()
        if not doctors: return "Error: Category not found."
        
        assigned_doctor = doctors[0]
        min_bookings = 999
        full_datetime_str = f"{appointment_date} {appointment_time}"

        for doc in doctors:
            cur.execute("SELECT COUNT(*) as count FROM appointments WHERE doctor_id = %s AND appointment_date = %s::timestamp AND status != 'Cancelled'", (doc['id'], full_datetime_str))
            count = cur.fetchone()['count']
            if count < min_bookings:
                min_bookings = count
                assigned_doctor = doc
        
        if min_bookings >= 2: return "FAILED: Capacity limit reached."

        cur.execute("""
            INSERT INTO appointments (patient_name, patient_phone, doctor_id, appointment_date, status, notes)
            VALUES (%s, %s, %s, %s::timestamp, 'Scheduled', %s) RETURNING id
        """, (patient_name, patient_phone, assigned_doctor['id'], full_datetime_str, symptoms))
        conn.commit()
        return f"SUCCESS: Appointment locked with {assigned_doctor['name']}. Booking ID: {cur.fetchone()['id']}."
    except Exception as e:
        return f"Failed to book in DB: {e}"
    finally:
        conn.close()

# 🌟 NAYA 🛠️ TOOL 3: Lookup Appointment (The AI's Memory)
def lookup_appointment(patient_phone: str) -> str:
    """Finds an existing appointment for a patient using their phone number."""
    print(f"🔎 [AI TOOL] Looking up details for {patient_phone}...")
    conn = get_db_connection()
    if not conn: return "Error connecting to database."
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT a.patient_name, d.specialty, d.name as doctor_name, a.appointment_date 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            WHERE a.patient_phone = %s AND a.status != 'Cancelled' 
            ORDER BY a.appointment_date DESC LIMIT 1
        """, (patient_phone,))
        apt = cur.fetchone()
        
        if not apt: return "No active appointment found for this phone number."
        return f"FOUND: Patient {apt['patient_name']} has an appointment for {apt['specialty']} with {apt['doctor_name']} on {apt['appointment_date']}."
    except Exception as e:
        return f"Failed to lookup DB: {e}"
    finally:
        conn.close()

# 🛠️ TOOL 4: Cancel Appointment
def cancel_appointment(patient_phone: str) -> str:
    """Cancels/Removes an existing appointment for the given phone number."""
    print(f"🗑️ [AI TOOL] Canceling appointment for {patient_phone}...")
    conn = get_db_connection()
    if not conn: return "Error connecting to database."
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id FROM appointments 
            WHERE patient_phone = %s AND status != 'Cancelled' 
            ORDER BY appointment_date DESC LIMIT 1
        """, (patient_phone,))
        apt = cur.fetchone()
        
        if not apt: return "FAILED: No active appointment found."
        
        cur.execute("DELETE FROM appointments WHERE id = %s", (apt['id'],))
        conn.commit()
        return "SUCCESS: Old appointment deleted successfully."
    except Exception as e:
        return f"Failed to delete in DB: {e}"
    finally:
        conn.close()


class MediForgeReceptionist:
    def __init__(self):
        today_date = datetime.now().strftime("%Y-%m-%d")
        
        self.system_prompt = f"""
        You are the Elite AI Receptionist for MediForge Hospital.
        
        CRITICAL RULES FOR LANGUAGE & TONE:
        1. LANGUAGE MIRRORING: You must perfectly mirror the language and tone of the user. If they speak Hinglish, reply in Hinglish. If they speak Japanese, reply in Japanese. 

        CRITICAL CONTEXT:
        - TODAY'S DATE IS: {today_date} 
        - DO NOT allow bookings for past dates.

        HOSPITAL CATEGORIES:
        - Cardiology (Heart)
        - Dermatology (Skin, hair)
        - Neurology (Headaches)
        - General Physician (Fever, cold)
        - Orthopedics (Bones)
        - Pediatrics (Children)

        🛑 WHATSAPP CONFIRMATION RULE (MANDATORY):
        EVERY SINGLE TIME you successfully book or reschedule an appointment, your response MUST end with the following information, translated into the user's language:
        "Your appointment is confirmed with [Doctor Name]. I am sending a WhatsApp message to your number right now with the booking details, along with a PDF of our hospital map and pre-visit instructions."

        🛑 RESCHEDULE / CANCEL LOGIC:
        1. Ask for Phone Number.
        2. USE `lookup_appointment` to find their details (Name and Specialty). DO NOT ask the user for their specialty.
        3. If Canceling: Use `cancel_appointment` and confirm.
        4. If Rescheduling: Ask for new date/time -> `check_availability` -> `cancel_appointment` -> `book_appointment`.
        """
        
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash", 
            system_instruction=self.system_prompt,
            # 🌟 NAYA: Added lookup_appointment to the tools array
            tools=[check_availability, book_appointment, lookup_appointment, cancel_appointment] 
        )
        self.chat_session = self.model.start_chat(enable_automatic_function_calling=True)

    def chat(self, user_message: str):
        print(f"\n🗣️ [Patient]: {user_message}")
        response = self.chat_session.send_message(user_message)
        print(f"🤖 [MediForge AI]: {response.text}")
        return response.text