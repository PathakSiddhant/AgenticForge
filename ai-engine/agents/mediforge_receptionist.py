# Path: ai-engine/agents/mediforge_receptionist.py
import os
import google.generativeai as genai
from db import get_db_connection
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# 🛠️ TOOL 1: Check Database by Category (The 3-Patient/Hour Logic)
def check_availability(specialty_category: str, target_date: str) -> str:
    """Checks available 1-hour slots for a specific medical category on a given date."""
    print(f"🔍 [AI TOOL] Checking {specialty_category} slots on {target_date}...")
    conn = get_db_connection()
    if not conn: return "Error connecting to database."
    
    try:
        cur = conn.cursor()
        # 1. Find all doctors in this category (e.g., 'Neurology', 'Cardiology')
        cur.execute("SELECT id, name FROM doctors WHERE specialty ILIKE %s", (f"%{specialty_category}%",))
        doctors = cur.fetchall()
        
        if not doctors:
            return f"We currently do not have a specialist for {specialty_category}. We have Cardiology, Dermatology, Neurology, and General Physicians."

        doc_ids = tuple([d['id'] for d in doctors])
        
        # 2. Standard 1-Hour Slots (Hospital Timings)
        standard_slots = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]
        available_slots = []

        # 3. Check bookings for these doctors on the target date
        cur.execute("""
            SELECT TO_CHAR(appointment_date, 'HH12:MI AM') as booked_time 
            FROM appointments 
            WHERE doctor_id IN %s AND DATE(appointment_date) = DATE(%s)
        """, (doc_ids, target_date))
        
        booked_records = cur.fetchall()
        
        # 4. Apply the "Max 3 patients per 1-hour slot" rule
        for slot in standard_slots:
            # Count how many patients are already booked for this exact slot
            patients_in_this_slot = sum(1 for record in booked_records if record['booked_time'] == slot)
            
            # If less than 3, the slot is available!
            if patients_in_this_slot < 3:
                available_slots.append(slot)

        if not available_slots:
            return f"All {specialty_category} slots are completely full on {target_date}. Please ask the patient for the next available date."
        
        return f"Available slots for {specialty_category} on {target_date} are: {', '.join(available_slots)}. Ask the patient which time works best."

    except Exception as e:
        return f"Database error: {e}"
    finally:
        conn.close()

# 🛠️ TOOL 2: Auto-Assign and Book
def book_appointment(patient_name: str, patient_phone: str, specialty_category: str, appointment_date: str, appointment_time: str, symptoms: str) -> str:
    """Books the appointment by auto-assigning an available doctor in the category."""
    print(f"📝 [AI TOOL] Booking {patient_name} for {specialty_category} at {appointment_time}...")
    conn = get_db_connection()
    if not conn: return "Error connecting to database."
    
    try:
        cur = conn.cursor()
        # Find doctors in this category
        cur.execute("SELECT id, name FROM doctors WHERE specialty ILIKE %s", (f"%{specialty_category}%",))
        doctors = cur.fetchall()
        if not doctors: return "Error: Category not found."
        
        # Auto-assign the first available doctor in that category (Simple Load Balancing)
        assigned_doctor = doctors[0] 
        
        # Combine Date and Time for DB
        full_datetime_str = f"{appointment_date} {appointment_time}"
        
        # Insert Booking
        cur.execute("""
            INSERT INTO appointments (patient_name, patient_phone, doctor_id, appointment_date, status, notes)
            VALUES (%s, %s, %s, %s::timestamp, 'Confirmed', %s) RETURNING id
        """, (patient_name, patient_phone, assigned_doctor['id'], full_datetime_str, symptoms))
        conn.commit()
        
        booking_id = cur.fetchone()['id']
        return f"SUCCESS: Appointment locked with {assigned_doctor['name']}. Booking ID: {booking_id}."
    except Exception as e:
        return f"Failed to book in DB: {e}"
    finally:
        conn.close()


class MediForgeReceptionist:
    def __init__(self):
        # 🌟 THE PERFECTED WORKFLOW PROMPT
        self.system_prompt = """
        You are the Elite AI Receptionist for MediForge Hospital. You handle both Voice Calls and WhatsApp messages.
        You are highly empathetic, professional, and guide patients smoothly.

        HOSPITAL CATEGORIES:
        - Cardiology (Heart, chest pain, BP)
        - Dermatology (Skin, hair, rashes)
        - Neurology (Headaches, migraines, nerve issues)
        - General Physician (Fever, cold, body ache, uneasiness)

        🛑 YOUR STRICT WORKFLOW (FOLLOW STEP-BY-STEP):
        
        STEP 1 - GREETING & SYMPTOMS: 
        Greet the patient. If they say they want an appointment but don't mention symptoms, politely ask: "Could you briefly tell me what you are experiencing so I can route you to the right department?"
        
        STEP 2 - DATE SELECTION:
        Once they tell you their symptoms (e.g., "headache for 3 days"), DO NOT tell them a doctor's name yet. Empathize with their pain, internally decide the category (e.g., Neurology), and ask: "I'm sorry you are feeling this way. Which date would you prefer to visit us?"
        
        STEP 3 - CHECK AVAILABILITY:
        Once you have the Date and internally know the Category, use the `check_availability` tool. 
        - If slots are available: Offer them the times (e.g., "We have slots at 10 AM and 2 PM. Which one works for you?").
        - If NO slots are available: Apologize and ask if they would like to check the next day.
        
        STEP 4 - PATIENT DETAILS:
        Once they select a time, ask for their Full Name and Phone Number to confirm the booking.
        
        STEP 5 - BOOK & CONFIRM (THE WHATSAPP TOUCH):
        Use the `book_appointment` tool. Once the tool returns SUCCESS, give them a final confirmation message exactly like this:
        "Your appointment is confirmed! I am sending a WhatsApp message to your number right now with the booking details, along with a PDF of our hospital map and pre-visit instructions. Get well soon!"
        
        RULES:
        - NEVER make up a time slot. Always rely on `check_availability`.
        - DO NOT mention the "Max 3 patients per slot" rule to the user. That is backend logic.
        """
        
        # Using the latest Gemini model
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash", 
            system_instruction=self.system_prompt,
            tools=[check_availability, book_appointment]
        )
        self.chat_session = self.model.start_chat(enable_automatic_function_calling=True)

    def chat(self, user_message: str):
        print(f"\n🗣️ [Patient]: {user_message}")
        response = self.chat_session.send_message(user_message)
        print(f"🤖 [MediForge AI]: {response.text}")
        return response.text