# Path: ai-engine/agents/vendor_negotiator.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Negotiation Scripts
# ==========================================
class NegotiationEmail(BaseModel):
    strategy_name: str = Field(description="E.g., 'The Collaborative Approach', 'The Competitive Match'")
    subject_line: str = Field(description="A highly clickable, professional email subject.")
    email_body: str = Field(description="The exact email script to send to the vendor.")
    psychology_used: str = Field(description="Briefly explain why this specific script works psychologically.")

class VendorNegotiatorSchema(BaseModel):
    vendor_type: str
    savings_potential: int = Field(description="Estimated dollars saved if negotiation is successful.")
    negotiation_scripts: List[NegotiationEmail]

class NegotiationRequest(BaseModel):
    vendor_type: str = Field(description="E.g., 'Wedding Caterer', 'Hotel Manager', 'AV Equipment Rental'")
    initial_quote: int = Field(description="The price the vendor asked for (USD).")
    target_budget: int = Field(description="The price the user wants to pay (USD).")
    leverage: str = Field(description="E.g., 'We have 3 more events this year', 'Competitor offered $4000'")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/travel/vendor-negotiator")
def generate_negotiation_scripts(request: NegotiationRequest):
    try:
        sys_prompt = """You are an elite, high-stakes B2B negotiator for travel and events. 
        Your job is to draft psychological, highly effective email scripts to negotiate down vendor quotes.
        
        CRITICAL RULES:
        1. Draft exactly 3 distinct email scripts based on different strategies:
           - The Collaborative (Partnership/Long-term focused)
           - The Competitive (Leveraging competitor quotes or market rates)
           - The Value-Add (If price can't drop, ask for free upgrades/extras)
        2. Never sound cheap or disrespectful. Maintain high professional standards.
        3. Seamlessly weave the user's 'leverage' into the scripts.
        4. Output strictly in the requested JSON format."""

        combined_content = f"VENDOR: {request.vendor_type}\nINITIAL QUOTE: ${request.initial_quote}\nTARGET BUDGET: ${request.target_budget}\nOUR LEVERAGE: {request.leverage}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=VendorNegotiatorSchema,
                system_instruction=sys_prompt,
                temperature=0.6 # Slightly creative for good copywriting
            )
        )
        
        negotiation_data = json.loads(response.text)
        return {"negotiation_plan": negotiation_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}