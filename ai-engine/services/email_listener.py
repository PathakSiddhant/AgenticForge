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

def is_spam_or_promo(sender_email, subject, body):
    """
    Very fast check BEFORE calling Gemini to save quota.
    """
    bad_domains = ['noreply', 'no-reply', 'marketing', 'newsletter', 'daemon', 'github', 'info@']
    bad_words = ['unsubscribe', 'webinar', 'promo', 'discount', 'newsletter', 'updates', 'digest']
    
    sender_lower = sender_email.lower()
    subject_lower = subject.lower()
    body_snippet = body[:500].lower()
    
    for domain in bad_domains:
        if domain in sender_lower: return True
        
    for word in bad_words:
        if word in subject_lower: return True
        
    # Check if the email sounds like an inquiry
    good_words = ['pricing', 'budget', 'help', 'automate', 'looking for', 'quote', 'need']
    if not any(word in body_snippet or word in subject_lower for word in good_words):
        return True # Probably not a lead if it doesn't have these words
        
    return False

def extract_lead_from_email(email_body, sender_name, sender_email):
    """Uses Gemini to convert a messy email into structured LeadForge data."""
    prompt = f"""
    You are an elite AI data extractor for 'AgenticForge'.
    A prospect just sent an inbound email inquiring about our services.
    
    EMAIL METADATA SENDER NAME: {sender_name}
    SENDER EMAIL: {sender_email}
    EMAIL BODY: 
    {email_body}
    
    Task: Extract the following details from the email. If a detail is missing, leave it as "".
    
    - name: 
        PRIORITY 1: Extract the actual personal name signed at the bottom/closing of the email body (e.g., "Best, Siddhant" -> "Siddhant"). 
        PRIORITY 2: If no personal name is signed, extract the Team/Company name from the sign-off. 
        PRIORITY 3: ONLY use the 'EMAIL METADATA SENDER NAME' if absolutely no name is found in the email body.
    - company_name: Extract the company they represent.
    - company_size: (e.g., "1-10", "11-50", "51-200", "200+")
    - budget: (e.g., "< $1k", "$1k - $5k", "$5k - $10k", "$10k+")
    - timeline: (e.g., "ASAP", "1-3 months", "3-6 months")
    - pain_point: A crisp 1-2 sentence summary of their problem.
    
    Output ONLY a valid JSON object matching this exact structure:
    {{
        "name": "Extracted Name Here",
        "email": "{sender_email}",
        "company_name": "...",
        "company_size": "...",
        "budget": "...",
        "timeline": "...",
        "pain_point": "..."
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
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

        # Sirf latest UNSEEN messages dhoondho
        status, messages = mail.search(None, 'UNSEEN')
        email_ids = messages[0].split()

        if not email_ids:
            return

        # 🌟 MAGIC FIX: Ek baar mein max 3 emails process karega taaki quota safe rahe
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

                    # 🌟 MAGIC FIX: Smart Pre-filter before wasting Gemini Quota
                    if is_spam_or_promo(sender_email, subject, body):
                        print(f"⏭️ [Email Listener] Skipped non-lead email from: {sender_email}")
                        continue

                    print(f"\n📧 [Email Listener] New Inbound Email from: {sender_name} <{sender_email}>")
                    print(f"Subject: {subject}")
                    
                    # AI Extraction (Only runs if pre-filter passed)
                    lead_data = extract_lead_from_email(body, sender_name, sender_email)
                    
                    if lead_data:
                        lead_data["source"] = "Inbound Email"
                        print(f"🤖 [AI Extractor] Data Parsed: {lead_data}")
                        
                        try:
                            # 🌟 MAGIC FIX: Cleaned URL string
                            api_res = requests.post("http://127.0.0.1:8000/api/leads/submit", json=lead_data)
                            if api_res.status_code == 200:
                                print(f"🚀 [Success] Email lead injected into CRM and automated reply sent!")
                            else:
                                print(f"⚠️ [API Error] Status: {api_res.status_code}, Response: {api_res.text}")
                        except Exception as req_err:
                            print(f"❌ [Network Error] Could not reach API: {req_err}")

        mail.logout()
    except Exception as e:
        print(f"❌ [IMAP Error] {e}")