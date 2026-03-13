# Path: ai-engine/seed_db.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv()

def seed_database():
    print("🚀 Initializing Enterprise MediForge Database...")
    conn = psycopg2.connect(os.environ.get("DATABASE_URL"), cursor_factory=RealDictCursor)
    cur = conn.cursor()

    try:
        print("🧹 Wiping old data...")
        cur.execute("TRUNCATE appointments, doctors RESTART IDENTITY CASCADE;")

        print("👨‍⚕️ Adding 15 Top Specialists across 6 Categories...")
        doctors_data = [
            ("Dr. A. Gupta", "Cardiology", "Mon-Sat 09AM-5PM"), ("Dr. R. Sharma", "Cardiology", "Mon-Fri 10AM-4PM"), ("Dr. V. Mehta", "Cardiology", "Tue-Sun 09AM-3PM"),
            ("Dr. S. Verma", "Dermatology", "Mon-Sat 10AM-6PM"), ("Dr. N. Kapoor", "Dermatology", "Wed-Sun 11AM-7PM"), ("Dr. T. Reddy", "Dermatology", "Mon-Fri 09AM-5PM"),
            ("Dr. K. Iyer", "Neurology", "Mon-Fri 09AM-5PM"), ("Dr. P. Sen", "Neurology", "Mon-Sat 10AM-4PM"),
            ("Dr. M. Singh", "General Physician", "Mon-Sun 08AM-8PM"), ("Dr. L. Joshi", "General Physician", "Mon-Sat 09AM-6PM"), ("Dr. H. Patel", "General Physician", "Mon-Fri 10AM-8PM"),
            ("Dr. A. Nair", "Orthopedics", "Mon-Sat 09AM-5PM"), ("Dr. S. Das", "Orthopedics", "Tue-Sun 10AM-6PM"),
            ("Dr. R. Khanna", "Pediatrics", "Mon-Fri 08AM-2PM"), ("Dr. J. D'Souza", "Pediatrics", "Mon-Sat 10AM-5PM")
        ]
        
        cur.executemany("INSERT INTO doctors (name, specialty, availability) VALUES (%s, %s, %s)", doctors_data)

        # Get the IDs of the new doctors
        cur.execute("SELECT id FROM doctors;")
        doc_ids = [d['id'] for d in cur.fetchall()]

        print("📅 Generating a busy, realistic schedule for Today & Tomorrow...")
        patients = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Neha", "Karan", "Pooja", "Simran", "Arjun", "Kavya", "Yash"]
        time_slots = ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "02:30 PM", "03:00 PM", "04:00 PM"]
        
        appointments_data = []
        today = datetime.now()

        # Generate 40 appointments
        for _ in range(40):
            patient = random.choice(patients) + " " + random.choice(["Sharma", "Singh", "Patel", "Kumar", "Iyer", "Desai", "Jain"])
            phone = f"+91 {random.randint(9000000000, 9999999999)}"
            doc_id = random.choice(doc_ids)
            
            # Mix of Today and Tomorrow
            days_ahead = random.choice([0, 1]) 
            target_date = today + timedelta(days=days_ahead)
            time_str = random.choice(time_slots)
            
            full_datetime_str = f"{target_date.strftime('%Y-%m-%d')} {time_str}"
            status = random.choice(["Confirmed", "In-Clinic", "Confirmed", "Confirmed"])
            
            appointments_data.append((patient, phone, doc_id, full_datetime_str, status, "Regular checkup"))

        cur.executemany("""
            INSERT INTO appointments (patient_name, patient_phone, doctor_id, appointment_date, status, notes) 
            VALUES (%s, %s, %s, %s::timestamp, %s, %s)
        """, appointments_data)

        conn.commit()
        print("✅ SUCCESS: Mega Hospital Database created!")
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()