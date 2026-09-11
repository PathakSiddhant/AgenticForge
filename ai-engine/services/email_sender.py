# Path: ai-engine/services/email_sender.py
import os
import smtplib
import urllib.parse 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Gemini configure karna for Warm Leads
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_warm_lead_content(lead_name, pain_point, budget):
    """
    Calls Gemini to generate a hyper-personalized strategic insight based on the lead's pain point.
    """
    print(f"🧠 [Email Engine] Generating custom strategy for Warm Lead: {lead_name}")
    prompt = f"""
    You are a Senior AI Strategist at 'AgenticForge', an elite AI automation agency. 
    Write a highly professional, concise, 2-paragraph email response to a prospect named {lead_name}.
    Their core challenge is: "{pain_point}".
    Their budget is around: {budget}.
    
    Task:
    1. Do NOT start with "Dear {lead_name}" (the template already handles greetings). Start directly with the insight.
    2. Acknowledge their problem intelligently.
    3. Provide a 1-2 sentence high-level strategic idea or AI workflow solution for their specific problem to build immense trust.
    4. End with a soft, open-ended question (e.g., "Would it be helpful if I sent over a brief case study or strategy outline regarding this?").
    5. Do NOT include any meeting links or pushy sales tactics.
    6. Return ONLY the HTML formatted text using <p> tags. No markdown code blocks like ```html.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        content = response.text.strip()
        # Clean markdown if Gemini adds it
        if content.startswith("```html"):
            content = content.replace("```html", "").replace("```", "").strip()
        return content
    except Exception as e:
        print(f"❌ [Email Engine] Gemini generation failed: {e}")
        return f"<p>Our team is currently reviewing your specific workflow needs regarding '{pain_point}'. We will get back to you shortly with a custom strategy tailored to your budget.</p>"


def send_confirmation_email(lead_id, lead_name, lead_email, ai_status, budget, timeline, pain):
    """
    Background task to send a premium HTML confirmation email dynamically based on AI Status.
    """
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ [Email Engine] Credentials not found in .env. Skipping email.")
        return

    # 🌟 DYNAMIC ROUTING & CONTENT GENERATION
    if ai_status == "Hot":
        # 🌟 MAGIC LINK GENERATOR
        safe_name = urllib.parse.quote(lead_name)
        magic_link = f"http://localhost:3000/book-call?lead_id={lead_id}&name={safe_name}"

        next_step = f"""
        <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin: 25px 0; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; color: #0369a1; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;"><strong>🔥 Priority Status Granted</strong></p>
            <p style="margin: 0 0 15px 0; color: #0c4a6e;">Our AI analysis flagged your request as high-priority enterprise. Let's skip the queue and get directly to the architecture.</p>
            <a href="{magic_link}" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Book Your Architecture Call &rarr;</a>
        </div>
        """
    elif ai_status == "Warm":
        # Call AI to generate custom value
        custom_ai_content = generate_warm_lead_content(lead_name, pain, budget)
        next_step = f"""
        <div style="background-color: #fef9c3; border-left: 4px solid #ca8a04; padding: 20px; margin: 25px 0; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; color: #854d0e; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;"><strong>🌤️ Initial Strategic Insight</strong></p>
            <div style="color: #422006; font-size: 15px; line-height: 1.6;">
                {custom_ai_content}
            </div>
        </div>
        """
    else:
        # COLD LEAD - Polite Reject / Newsletter
        next_step = """
        <div style="background-color: #f1f5f9; border-left: 4px solid #64748b; padding: 20px; margin: 25px 0; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; color: #334155; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;"><strong>❄️ Next Steps</strong></p>
            <p style="margin: 0; color: #1e293b; font-size: 15px;">While your current requirements fall slightly outside our immediate custom enterprise deployment criteria, we have added you to our Agentic Insider Newsletter. Stay tuned for powerful AI workflows and updates you can implement yourself!</p>
        </div>
        """

    # 🌟 THE PREMIUM HTML TEMPLATE
    html_content = f"""
    <html>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f5; padding: 30px 15px;">
        <div style="max-w: 600px; margin: 0 auto; background-color: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #050505; padding: 35px 20px; text-align: center; border-bottom: 3px solid #2563eb;">
                <h1 style="margin: 0; color: white; font-size: 26px; letter-spacing: 2px;">AGENTIC FORGE</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Enterprise AI Automation</p>
            </div>
            
            <div style="padding: 40px 35px;">
                <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Inquiry Acknowledged</h2>
                <p style="font-size: 16px;">Hi {lead_name},</p>
                <p style="font-size: 16px;">Thank you for reaching out. This is an automated confirmation that our AI intelligence system has successfully received and analyzed your request.</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 12px 0; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px;">Your Submitted Record</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
                        <li style="margin-bottom: 8px;"><strong>Target Budget:</strong> {budget}</li>
                        <li style="margin-bottom: 8px;"><strong>Timeline:</strong> {timeline}</li>
                        <li><strong>Primary Challenge:</strong> <i style="color: #0f172a;">"{pain}"</i></li>
                    </ul>
                </div>
                
                {next_step}
                
                <p style="margin-top: 40px; color: #64748b; font-size: 13px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Best regards,<br>
                    <strong style="color: #334155;">LeadForge Intelligence Agent</strong><br>
                    Autonomous SDR @ AgenticForge<br>
                    <a href="https://agenticforge.com" style="color: #2563eb; text-decoration: none;">www.agenticforge.com</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"AgenticForge AI <{sender_email}>"
    msg['To'] = lead_email
    msg['Subject'] = f"Re: Your AI Automation Request - AgenticForge"
    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ [Email Engine] Premium confirmation successfully shot to {lead_email}! (Status: {ai_status})")
    except Exception as e:
        print(f"❌ [Email Engine] Failed to send email: {e}")


# 🌟 NAYA: Meeting Confirmation Email Function with real SMTP logic
def send_meeting_confirmation_email(lead_name, lead_email, meeting_date, meeting_time, meet_link):
    """Meeting book hone ke baad automatic confirmation mail"""
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ [Email Engine] Credentials not found in .env. Skipping meeting confirmation email.")
        return

    html_content = f"""
    <html>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f5; padding: 30px 15px;">
        <div style="max-w: 600px; margin: 0 auto; background-color: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #050505; padding: 35px 20px; text-align: center; border-bottom: 3px solid #2563eb;">
                <h1 style="margin: 0; color: white; font-size: 26px; letter-spacing: 2px;">AGENTIC FORGE</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Architecture Review Scheduled</p>
            </div>
            
            <div style="padding: 40px 35px;">
                <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Meeting Confirmed, {lead_name}! 🎉</h2>
                <p style="font-size: 16px;">Your 30-minute Architecture Review with AgenticForge is officially locked in.</p>
                
                <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <ul style="margin: 0; padding-left: 0; list-style-type: none; color: #0c4a6e; font-size: 15px;">
                        <li style="margin-bottom: 12px;"><strong>📅 Date:</strong> {meeting_date}</li>
                        <li style="margin-bottom: 12px;"><strong>⏰ Time:</strong> {meeting_time}</li>
                        <li><strong>🔗 Video Link:</strong> <a href="{meet_link}" style="color: #0284c7; text-decoration: underline;">Join Google Meet Here</a></li>
                    </ul>
                </div>
                
                <p style="font-size: 16px;">Our senior engineers will review your submitted requirements beforehand so we can dive straight into high-level solutions and ROI discussions.</p>
                <p style="font-size: 16px;">See you then!</p>
                
                <p style="margin-top: 40px; color: #64748b; font-size: 13px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Best regards,<br>
                    <strong style="color: #334155;">The AgenticForge Team</strong><br>
                    <a href="https://agenticforge.com" style="color: #2563eb; text-decoration: none;">www.agenticforge.com</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg = MIMEMultipart()
    msg['From'] = f"AgenticForge AI <{sender_email}>"
    msg['To'] = lead_email
    msg['Subject'] = f"📅 Confirmed: Architecture Review with AgenticForge"
    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ [Email Engine] Meeting Confirmation successfully shot to {lead_email}!")
    except Exception as e:
        print(f"❌ [Email Engine] Failed to send meeting confirmation email: {e}")