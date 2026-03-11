# Path: ai-engine/agents/cold_outreach.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Cold Email Campaign
# ==========================================
class OutreachSchema(BaseModel):
    subject_lines: List[str] = Field(description="3 catchy, non-clickbaity, short subject lines.")
    email_body: str = Field(description="The main cold email body. Must be personalized, concise, and end with a clear Call to Action (CTA).")
    personalization_angle: str = Field(description="A brief explanation of WHY this specific angle was chosen for this prospect.")
    spam_score_warning: str = Field(description="Low, Medium, or High based on the usage of salesy buzzwords. Aim for Low.")

class OutreachRequest(BaseModel):
    prospect_info: str = Field(description="Bio, LinkedIn summary, or recent news about the target prospect.")
    our_product: str = Field(description="What we are selling and its core value proposition.")
    tone: str = Field(description="e.g., Direct, Professional, Casual, or Humorous.", default="Professional yet conversational")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/sales/cold-outreach")
def generate_outreach(request: OutreachRequest):
    try:
        # The Elite SDR Logic
        sys_prompt = """You are an elite B2B Sales Development Representative (SDR) and Copywriting AI.
        Your job is to write a highly converting, non-spammy cold email.
        RULE 1: NO generic openings like 'I hope this email finds you well'.
        RULE 2: The email must feel heavily personalized based on the prospect's info.
        RULE 3: Keep it under 150 words. Be respectful of their time.
        RULE 4: Strictly follow the requested JSON format."""

        combined_content = f"PROSPECT CONTEXT:\n{request.prospect_info}\n\nOUR PRODUCT/OFFER:\n{request.our_product}\n\nDESIRED TONE:\n{request.tone}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=OutreachSchema,
                system_instruction=sys_prompt,
                temperature=0.4 # A bit of creativity for writing good copy
            )
        )
        
        outreach_data = json.loads(response.text)
        return {"campaign": outreach_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}