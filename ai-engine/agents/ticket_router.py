# Path: ai-engine/agents/ticket_router.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Ticket Routing
# ==========================================
class TicketRoutingSchema(BaseModel):
    category: str = Field(description="Strictly classify into: Billing, Technical Support, Bug Report, Feature Request, or General Inquiry.")
    urgency_level: str = Field(description="Strictly classify as: Low, Medium, High, or Critical.")
    assigned_department: str = Field(description="Which team should handle this: e.g., 'Tier 2 Tech Support', 'Finance/Billing', 'Customer Success'.")
    one_line_summary: str = Field(description="A crisp 5-10 word summary of the customer's issue for the dashboard.")
    escalation_required: bool = Field(description="True if the customer is extremely angry or threatening to leave/sue, otherwise False.")

class TicketRequest(BaseModel):
    customer_message: str = Field(description="The raw, messy text from the customer's email or chat.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/support/ticket-router")
def route_ticket(request: TicketRequest):
    try:
        # The Elite Support Triage Logic
        sys_prompt = """You are an elite AI Support Triage Manager. 
        Your job is to read incoming customer support tickets and instantly categorize, prioritize, and route them to the correct department.
        Ignore the customer's spelling mistakes or ranting; focus on the core issue.
        If a customer mentions legal action, system downtime, or extreme frustration, mark 'escalation_required' as True and urgency as Critical.
        Strictly output in the requested JSON format."""

        combined_content = f"INCOMING CUSTOMER MESSAGE:\n{request.customer_message}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TicketRoutingSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Needs to be highly deterministic and accurate
            )
        )
        
        routing_data = json.loads(response.text)
        return {"routing": routing_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}