# Path: ai-engine/utils.py
import random
import os
from fpdf import FPDF
from twilio.rest import Client

def generate_appointment_pdf(patient_name, date, time, doctor, department, phone):
    """1000% Crash-Proof Professional PDF generation."""
    mrn = f"MF-2026-{random.randint(10000, 99999)}"
    
    # Strict A4 dimensions, no custom margins to avoid math bugs
    pdf = FPDF(orientation='P', unit='mm', format='A4')
    pdf.add_page()
    
    # 1. HEADER (Center Aligned)
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(190, 10, "MediForge Hospital", ln=True, align="C")
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(190, 5, "Plot No. IS-2027-2031, Ramchandrapura, Rajasthan 302022", ln=True, align="C")
    pdf.cell(190, 5, "Helpdesk: +91 900 800 5000 | Email: support@fake-demo-mediforge.in", ln=True, align="C")
    
    pdf.ln(5)
    
    # 2. DIVIDER LINE
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(10)
    
    # 3. TITLE
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(190, 10, "APPOINTMENT CONFIRMATION RECEIPT", ln=True, align="C")
    pdf.ln(5)
    
    # 4. GREETING
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(190, 8, "Dear Valued Patient,", ln=True)
    pdf.multi_cell(190, 6, "Your appointment has been successfully scheduled. Please find your official booking details below. Kindly carry a digital or printed copy of this document to the reception on the day of your visit.")
    pdf.ln(8)
    
    # 5. PATIENT DETAILS (Premium Gray Background Block, NO TABLES)
    pdf.set_fill_color(245, 245, 245) # Light gray background
    
    details = [
        ("Patient Name:", str(patient_name)),
        ("Patient ID (MRN):", str(mrn)),
        ("Date of Visit:", str(date)),
        ("Reporting Time:", str(time)),
        ("Consulting Doctor:", str(doctor)),
        ("Department:", str(department))
    ]
    
    # 50 + 140 = 190 (Exact width of A4 printable area)
    for label, value in details:
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(50, 10, f"  {label}", border=0, fill=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(140, 10, value, border=0, fill=True, ln=True)
        
    pdf.ln(12)
    
    # 6. INSTRUCTIONS (Safe text dashes instead of special bullet characters)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(190, 8, "Pre-Visit Instructions & Guidelines:", ln=True)
    pdf.set_font("Helvetica", "", 10)
    
    pdf.multi_cell(190, 6, "- Please arrive at least 15 minutes before your scheduled time.")
    pdf.multi_cell(190, 6, "- Bring a valid photo ID and any past medical records.")
    pdf.multi_cell(190, 6, "- Fasting is only required if specific blood tests have been advised.")
    pdf.multi_cell(190, 6, "- For cancellations, please notify us 24 hours in advance.")
    
    pdf.ln(15)
    
    # 7. FOOTER
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(190, 5, "This is a system-generated document. No physical signature is required.", ln=True, align="C")
    
    # Save the file safely
    clean_phone = "".join(filter(str.isdigit, str(phone)))
    filename = f"MF-Booking-{clean_phone}.pdf"
    filepath = os.path.join("static", filename)
    pdf.output(filepath)
    
    return filename, mrn


def send_formatted_whatsapp_ticket(patient_name, date, time, doctor, department, phone, pdf_filename):
    """Sends a beautifully formatted WhatsApp message with the attached PDF link."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_WHATSAPP_NUMBER")
    base_url = os.getenv("BASE_URL")
    
    if not all([account_sid, auth_token, twilio_number, base_url]):
        print("❌ Missing Twilio variables in .env.")
        return

    client = Client(account_sid, auth_token)

    clean_phone = str(phone).replace(" ", "")
    if not clean_phone.startswith("whatsapp:"):
        if not clean_phone.startswith("+"):
            clean_phone = f"+91{clean_phone}" 
        target_phone = f"whatsapp:{clean_phone}"
    else:
        target_phone = clean_phone

    base_url = base_url.rstrip('/')
    pdf_url = f"{base_url}/static/{pdf_filename}"

    message_body = (
        "🏥 *MediForge Clinic & Hospital*\n"
        "━━━━━━━━━━━━━━━━━━━━\n\n"
        f"Dear *{patient_name}*,\n"
        "Your appointment has been successfully confirmed! ✅\n\n"
        f"📅 *Date:* {date}\n"
        f"⏰ *Time:* {time}\n"
        f"👨‍⚕️ *Doctor:* {doctor}\n"
        f"🩺 *Dept:* {department}\n\n"
        "📎 _Please download your official Appointment Confirmation PDF attached below._\n\n"
        "Reply *'Hi'* if you need any further assistance.\n"
        "Get well soon! 💙"
    )

    try:
        message = client.messages.create(
            from_=twilio_number,
            body=message_body,
            to=target_phone,
            media_url=[pdf_url]
        )
        print(f"✅ WhatsApp Official Ticket sent! SID: {message.sid}")
    except Exception as e:
        print(f"❌ Twilio WhatsApp Sending Error: {e}")