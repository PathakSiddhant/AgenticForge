# Path: ai-engine/agents/auto_responder.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Auto-Responder Draft
# ==========================================
class ResponderSchema(BaseModel):
    draft_reply: str = Field(description="The fully written, empathetic, and professional email reply to the customer.")
    tone_used: str = Field(description="The tone applied to the message (e.g., 'Empathetic and Apologetic', 'Professional and Informative').")
    policy_followed: str = Field(description="A brief note on how the company policy was applied in this reply.")
    needs_human_review: bool = Field(description="Set to True if the customer's request goes against policy or is too complex for an automated reply.")

class ResponderRequest(BaseModel):
    customer_message: str = Field(description="The message or complaint from the customer.")
    company_policy: str = Field(description="The relevant company policy (e.g., 'Refunds only within 30 days', 'Standard shipping is 5-7 days').")
    customer_name: str = Field(description="The name of the customer for personalization.", default="Valued Customer")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/support/auto-responder")
def generate_reply(request: ResponderRequest):
    try:
        # The Empathetic Writer Logic
        sys_prompt = """You are an elite, highly empathetic Customer Support Specialist.
        Your job is to read the customer's message and draft a perfect, polite email reply based strictly on the provided company policy.
        Never invent or promise things outside the policy. 
        If the customer is upset, validate their feelings and apologize for the inconvenience before providing the solution.
        If the request completely contradicts the policy, draft a polite refusal and set 'needs_human_review' to True.
        Strictly output in the requested JSON format."""

        combined_content = f"CUSTOMER NAME: {request.customer_name}\n\nCOMPANY POLICY:\n{request.company_policy}\n\nCUSTOMER MESSAGE:\n{request.customer_message}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResponderSchema,
                system_instruction=sys_prompt,
                temperature=0.3 # Slight creativity for natural, human-sounding empathy
            )
        )
        
        reply_data = json.loads(response.text)
        return {"response_draft": reply_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}