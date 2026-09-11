import random
from datetime import datetime, timedelta
from db import get_db_connection

# ==========================================
# 🧠 DUMMY DATA POOLS
# ==========================================
FIRST_NAMES = ["Aarav", "Neha", "Vikram", "Pooja", "Siddhant", "Rohan", "Ananya", "Kabir", "Meera", "Aditya", "Sarah", "John", "Michael", "Emma"]
LAST_NAMES = ["Sharma", "Gupta", "Verma", "Patel", "Singh", "Kumar", "Iyer", "Smith", "Johnson", "Williams"]
COMPANIES = ["TechFlow", "SwiftKicks", "NexaCorp", "CloudSync", "DataMinds", "Acme Corp", "GlobalTech", "Zenith", "Apex Systems", "Stark Industries"]
PAIN_POINTS = [
    "Customer support team is overwhelmed with Level-1 queries.",
    "Sales pipeline is dry, need automated lead generation.",
    "Manual data entry across 3 CRMs is causing massive errors.",
    "No visibility into marketing ROI, need an analytics dashboard.",
    "High churn rate because of slow email response times.",
    "Looking to automate our HR onboarding process.",
    "Need a chatbot to schedule clinical appointments automatically."
]

def generate_random_date(days_back=30):
    """Generates a random date within the last 'days_back' days"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    random_days = random.randrange((end_date - start_date).days)
    return start_date + timedelta(days=random_days)

def seed_leadforge_data(num_leads=50):
    print(f"🌱 [Seeder] Clearing old dummy data and generating {num_leads} fresh leads...")
    conn = get_db_connection()
    if not conn:
        print("❌ [Seeder] DB Connection failed!")
        return

    try:
        cur = conn.cursor()
        
        # 🌟 OPTIONAL: Agar tu chahta hai ki har baar DB saaf hoke naya data aaye
        # (Sirf leads aur meetings table saaf hongi, baaki DB safe rahega)
        # cur.execute("DELETE FROM meetings")
        # cur.execute("DELETE FROM leads")
        
        # 1. Generate Leads
        for i in range(num_leads):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            name = f"{first_name} {last_name}"
            
            # 🌟 MAGIC FIX: Email mein unique number daal diya taaki duplicate constraint hit na ho
            unique_id = random.randint(1000, 99999)
            email = f"{first_name.lower()}.{last_name.lower()}_{i}_{unique_id}@example.com"
            
            company = random.choice(COMPANIES)
            company_size = random.choice(["1-10", "11-50", "51-200", "200+"])
            budget = random.choice(["< $1k", "$1k - $5k", "$5k - $10k", "$10k+"])
            timeline = random.choice(["ASAP", "1-3 months", "3-6 months"])
            pain_point = random.choice(PAIN_POINTS)
            
            # AI Scoring Simulation
            ai_score = random.randint(20, 95)
            if ai_score >= 70:
                status = "Hot"
                reasoning = "High budget, urgent timeline, and clear pain point match."
            elif ai_score >= 40:
                status = "Warm"
                reasoning = "Good fit but timeline is relaxed. Needs nurturing."
            else:
                status = "Cold"
                reasoning = "Low budget and undefined timeline. Added to newsletter."

            # 20% chance to be already scheduled for a meeting
            is_scheduled = random.random() < 0.20
            if is_scheduled:
                status = "Meeting Scheduled"

            created_at = generate_random_date(30) # Spread over last 30 days

            # Insert Lead
            cur.execute("""
                INSERT INTO leads (name, email, company_name, company_size, budget, timeline, pain_point, source, ai_score, lead_status, ai_reasoning, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """, (name, email, company, company_size, budget, timeline, pain_point, "Dummy Seeder", ai_score, status, reasoning, created_at))
            
            lead_id = cur.fetchone()['id']

            # 2. Generate Meeting if Scheduled
            if is_scheduled:
                # Meeting date could be past or future
                meet_date_obj = created_at + timedelta(days=random.randint(1, 10))
                meet_date = meet_date_obj.strftime("%Y-%m-%d")
                meet_time = random.choice(["10:00 AM", "02:30 PM", "04:00 PM", "11:15 AM"])
                meet_link = f"https://meet.google.com/xyz-dummy-123"

                # If meeting is in the past, mark lead as 'Completed Meeting'
                if meet_date_obj < datetime.now():
                    cur.execute("UPDATE leads SET lead_status = 'Completed Meeting' WHERE id = %s", (lead_id,))

                cur.execute("""
                    INSERT INTO meetings (lead_id, meeting_date, meeting_time, meet_link, notes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (lead_id, meet_date, meet_time, meet_link, "Seeded Meeting"))

        conn.commit()
        print(f"✅ [Seeder] Successfully injected {num_leads} unique leads and their meetings!")
    except Exception as e:
        conn.rollback()
        print(f"❌ [Seeder] Error inserting data: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_leadforge_data(50)