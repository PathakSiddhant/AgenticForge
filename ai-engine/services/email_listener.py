import os
import time
import imaplib
import email
from email.header import decode_header
import json
import requests
import google.generativeai as genai
from dotenv import load_dotenv

# Env variables load karna
load_dotenv()

# Gemini Setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Email Credentials
IMAP_SERVER = "imap.gmail.com"
EMAIL_ACCOUNT = os.getenv("SENDER_EMAIL")
EMAIL_PASSWORD = os.getenv("SENDER_PASSWORD")

def is_automated_bot(sender_email):
    """
    Sirf extreme bots (no-reply) ko rokenge taaki API quota bache.
    Baaki saara dimag Gemini lagayega.
    """
    bad_domains = ['noreply', 'no-reply', 'daemon', 'alerts@', 'mailer-daemon']
    sender_lower = sender_email.lower()
    for domain in bad_domains:
        if domain in sender_lower: return True
    return False

def extract_lead_from_email(email_body, sender_name, sender_email):
    """Uses Gemini as an Autonomous Triage Agent to classify AND extract data."""
    prompt = f"""
    You are an elite AI Inbox Triage Agent for 'LeadForge CRM'.
    Read the following inbound email. 
    
    SENDER NAME: {sender_name}
    SENDER EMAIL: {sender_email}
    EMAIL BODY: 
    {email_body}
    
    STEP 1: INTENT CLASSIFICATION
    Determine if this is a potential B2B software/service lead, inquiry, or a request for technical architecture help. 
    If it's obvious spam, a generic newsletter, a promotional email, or completely unrelated personal chatter, set "is_valid_lead" to false.
    
    STEP 2: DATA EXTRACTION (If valid lead)
    Extract the following. If exact info isn't present, make an educated professional guess based on the context:
    - name: The actual personal name of the sender (extract from sign-off if possible, else use {sender_name}).
    - company_name: Company they represent (infer from email domain or text if not explicitly stated. Default to "Independent" if unknown).
    - company_size: (e.g., "1-10", "11-50", "51-200", "200+") Guess based on context.
    - budget: (e.g., "< $1k", "$1k - $5k", "$5k - $10k", "$10k+") Guess based on context.
    - timeline: (e.g., "ASAP", "1-3 months", "3-6 months") Guess based on urgency.
    - pain_point: A crisp 1-2 sentence summary of their problem.
    
    Output ONLY a valid JSON object matching this exact structure:
    {{
        "is_valid_lead": true,
        "name": "...",
        "email": "{sender_email}",
        "company_name": "...",
        "company_size": "...",
        "budget": "...",
        "timeline": "...",
        "pain_point": "..."
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-3.6-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"❌ Gemini Extraction Error: {e}")
        return None

def check_inbox():
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
        mail.select('inbox')

        status, messages = mail.search(None, 'UNSEEN')
        email_ids = messages[0].split()

        if not email_ids:
            return

        # Ek baar mein max 3 emails
        email_ids = email_ids[-3:] 

        for e_id in email_ids:
            status, msg_data = mail.fetch(e_id, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")
                        
                    from_header = msg.get("From")
                    sender_name, sender_email = email.utils.parseaddr(from_header)
                    
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                try:
                                    body = part.get_payload(decode=True).decode()
                                    break
                                except:
                                    pass
                    else:
                        body = msg.get_payload(decode=True).decode()

                    # 🌟 Smart Pre-filter (Only block hardcoded bots)
                    if is_automated_bot(sender_email):
                        print(f"⏭️ [System Filter] Skipped automated bot email from: {sender_email}")
                        continue

                    print(f"\n📧 [Email Listener] Reading Email from: {sender_name} <{sender_email}>")
                    print(f"Subject: {subject}")
                    
                    # 🌟 The AI Brain evaluates the email
                    lead_data = extract_lead_from_email(body, sender_name, sender_email)
                    
                    if lead_data and lead_data.get("is_valid_lead"):
                        # Remove AI logic flag before sending to API
                        del lead_data["is_valid_lead"]
                        lead_data["source"] = "Inbound Email"
                        print(f"🤖 [AI Extractor] Brilliant! Valid Lead Parsed: {lead_data['name']} - {lead_data['pain_point']}")
                        
                        try:
                            api_res = requests.post("http://127.0.0.1:8000/api/leads/submit", json=lead_data)
                            if api_res.status_code == 200:
                                print(f"🚀 [Success] Email lead injected into CRM and automated reply sent!")
                            else:
                                print(f"⚠️ [API Error] Status: {api_res.status_code}, Response: {api_res.text}")
                        except Exception as req_err:
                            print(f"❌ [Network Error] Could not reach API: {req_err}")
                    else:
                        print(f"⏭️ [AI Triage] Gemini analyzed and decided this is NOT a business lead. Skipped.")

        mail.logout()
    except Exception as e:
        print(f"❌ [IMAP Error] {e}")