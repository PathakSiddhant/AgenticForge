# Path: ai-engine/utils/email_sender.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_confirmation_email(lead_name, lead_email, ai_status, budget, timeline, pain):
    """
    Background task to send a premium HTML confirmation email to the lead.
    """
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ [Email Engine] Credentials not found in .env. Skipping email.")
        return

    # 🌟 DYNAMIC ROUTING: AI ke score ke hisaab se email ka Next Step change hoga!
    if ai_status == "Hot":
        next_step = f"""
        <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #0369a1;"><strong>🔥 Priority Status Granted</strong></p>
            <p style="margin: 5px 0 10px 0;">Our AI analysis flagged your request as high-priority. Let's skip the queue.</p>
            <a href="http://localhost:3000/book-call" style="display: inline-block; background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Your Consultation Now &rarr;</a>
        </div>
        """
    elif ai_status == "Warm":
        next_step = """
        <div style="background-color: #fef9c3; border-left: 4px solid #ca8a04; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #854d0e;"><strong>🌤️ Application Under Review</strong></p>
            <p style="margin: 5px 0 0 0;">Our team is reviewing your specific use-case. We will send over a tailored AI workflow strategy shortly.</p>
        </div>
        """
    else:
        next_step = "<p>We have added you to our tech newsletter. Stay tuned for AI updates!</p>"

    # 🌟 THE PREMIUM HTML TEMPLATE (Proof of Response)
    html_content = f"""
    <html>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f5; padding: 20px;">
        <div style="max-w: 600px; margin: 0 auto; background-color: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #0f172a; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 24px; letter-spacing: 1px;">AGENTIC FORGE</h1>
            </div>
            
            <div style="padding: 40px 30px;">
                <h2 style="margin-top: 0; color: #111827;">Request Acknowledged</h2>
                <p>Hi {lead_name},</p>
                <p>Thank you for reaching out. This is an automated confirmation that our AI system has successfully received and logged your consultation request.</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 10px 0; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Your Submitted Record</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #334155;">
                        <li style="margin-bottom: 5px;"><strong>Target Budget:</strong> {budget}</li>
                        <li style="margin-bottom: 5px;"><strong>Timeline:</strong> {timeline}</li>
                        <li><strong>Primary Challenge:</strong> <i>"{pain}"</i></li>
                    </ul>
                </div>
                
                {next_step}
                
                <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                    Best regards,<br>
                    <strong>LeadForge AI Agent</strong><br>
                    Autonomous SDR @ AgenticForge
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"AgenticForge AI <{sender_email}>"
    msg['To'] = lead_email
    msg['Subject'] = "Request Received - AgenticForge AI"
    msg.attach(MIMEText(html_content, 'html'))

    try:
        # Connecting to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ [Email Engine] Confirmation successfully shot to {lead_email}!")
    except Exception as e:
        print(f"❌ [Email Engine] Failed to send email: {e}")