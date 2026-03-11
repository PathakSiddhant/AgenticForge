# Path: ai-engine/agents/refund_automator.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Automated Refund Decision
# ==========================================
class RefundDecisionSchema(BaseModel):
    decision: str = Field(description="Strictly output one of: 'Approved', 'Rejected', or 'Needs Human Review'.")
    reasoning: str = Field(description="Internal note explaining WHY this decision was made based strictly on the policy.")
    customer_response: str = Field(description="A polite, empathetic email/message draft informing the customer of the decision.")
    refund_amount: float = Field(description="The exact amount to be refunded (0 if rejected).")

class RefundRequest(BaseModel):
    customer_reason: str = Field(description="Why the customer wants a refund (e.g., 'Broken item', 'Arrived late', 'Just didn't like it').")
    days_since_purchase: int = Field(description="How many days have passed since the purchase date.")
    purchase_amount: float = Field(description="The total amount the customer paid.")
    company_policy: str = Field(description="The strict internal policy for refunds.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/support/refund-automator")
def process_refund(request: RefundRequest):
    try:
        # The Objective Refund Logic
        sys_prompt = """You are an elite AI Automated RMA (Return Merchandise Authorization) Manager.
        Your job is to read the customer's refund request and strictly apply the company policy.
        You cannot make exceptions. If the policy says '30 days max' and it's day 31, you must Reject it.
        If it's a borderline case or involves physical damage not covered clearly, mark it as 'Needs Human Review'.
        Your customer response must be highly empathetic, even if rejecting the refund.
        Strictly output in the requested JSON format."""

        combined_content = f"COMPANY POLICY:\n{request.company_policy}\n\nPURCHASE DETAILS:\nAmount: ${request.purchase_amount}\nDays Since Purchase: {request.days_since_purchase} days\n\nCUSTOMER REASON:\n{request.customer_reason}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RefundDecisionSchema,
                system_instruction=sys_prompt,
                temperature=0.0 # Absolute 0 temperature. We want zero hallucination when dealing with money!
            )
        )
        
        refund_data = json.loads(response.text)
        return {"rma_decision": refund_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}