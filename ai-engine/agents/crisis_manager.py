# Path: ai-engine/agents/crisis_manager.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Crisis Management
# ==========================================
class ActionStep(BaseModel):
    step_number: int
    action: str = Field(description="Clear, concise instruction of what to do.")
    assigned_to: str = Field(description="Who should ideally do this (e.g., 'Event Coordinator', 'Logistics Lead').")

class CrisisPlanSchema(BaseModel):
    threat_level: str = Field(description="E.g., 'High - Immediate Threat to Event', 'Medium - Disruption', 'Low - Annoyance'")
    immediate_actions: List[ActionStep]
    guest_communication_template: str = Field(description="A professional, calm email/SMS text to notify guests/clients without causing panic.")
    vendor_mitigation_strategy: str = Field(description="Advice on how to handle vendors or get refunds/credits for this specific crisis.")

class CrisisRequest(BaseModel):
    event_type: str = Field(description="E.g., 'Outdoor Corporate Retreat', 'International Group Tour'")
    crisis_description: str = Field(description="What went wrong? E.g., 'Heavy rain started, tents are leaking'.")
    current_status: str = Field(description="E.g., 'Guests arriving in 30 mins'.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/travel/crisis-manager")
def generate_crisis_plan(request: CrisisRequest):
    try:
        sys_prompt = """You are an elite, calm, and hyper-logical Crisis Manager for high-stakes events and travel.
        Your job is to read a panic situation and instantly provide a structured, actionable mitigation plan.
        
        CRITICAL RULES:
        1. Action steps must be immediate and practical (e.g., 'Move speakers away from water', NOT 'Re-evaluate the weather').
        2. The guest communication MUST be extremely professional, reassuring, and solution-oriented. Never use words like 'Disaster' or 'Panic'.
        3. Output strictly in the requested JSON format."""

        combined_content = f"EVENT TYPE: {request.event_type}\nCRISIS: {request.crisis_description}\nSTATUS: {request.current_status}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CrisisPlanSchema,
                system_instruction=sys_prompt,
                temperature=0.2 # Very low temp for logical, non-hallucinated survival steps
            )
        )
        
        crisis_data = json.loads(response.text)
        return {"crisis_plan": crisis_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}