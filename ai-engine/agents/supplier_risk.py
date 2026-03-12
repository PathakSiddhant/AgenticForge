# Path: ai-engine/agents/supplier_risk.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Supplier Risk Evaluation
# ==========================================
class RiskSchema(BaseModel):
    overall_risk_score: int = Field(description="A score from 0 to 100. 100 means extreme risk, 0 means perfectly safe.")
    risk_level: str = Field(description="Strictly output: Low, Medium, High, or Critical.")
    identified_red_flags: List[str] = Field(description="Top 2-4 critical warnings found in the contract or delivery history (e.g., 'No penalty for late delivery', 'Consistent 3-day delays').")
    strategic_recommendation: str = Field(description="Actionable advice for the procurement team (e.g., 'Renegotiate SLA terms', 'Find a backup supplier').")

class RiskRequest(BaseModel):
    supplier_name: str = Field(description="Name of the vendor/supplier.")
    contract_terms: str = Field(description="Key clauses from their Service Level Agreement (SLA) or contract.")
    past_performance_history: str = Field(description="Data on their recent deliveries, delays, or quality issues.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/logistics/supplier-risk")
def evaluate_risk(request: RiskRequest):
    try:
        # The Elite Auditor Logic
        sys_prompt = """You are an elite Supply Chain Risk Auditor and Legal Analyst.
        Your job is to protect the company from unreliable suppliers.
        Analyze the provided contract terms and past performance history.
        Look for hidden liabilities, lack of penalties for delays, and historical patterns of failure.
        Be ruthless in your evaluation. If they have a history of delays and a weak contract, score them High or Critical risk.
        Strictly output the data in the requested JSON format."""

        combined_content = f"SUPPLIER: {request.supplier_name}\n\nCONTRACT/SLA TERMS:\n{request.contract_terms}\n\nPAST PERFORMANCE HISTORY:\n{request.past_performance_history}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RiskSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very low temp for objective legal and operational analysis
            )
        )
        
        risk_data = json.loads(response.text)
        return {"evaluation": risk_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}