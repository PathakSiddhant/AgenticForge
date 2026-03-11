# Path: ai-engine/agents/churn_predictor.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Churn Prediction
# ==========================================
class ChurnSchema(BaseModel):
    churn_risk: str = Field(description="Strictly output: High, Medium, or Low.")
    sentiment_analysis: str = Field(description="A crisp 1-2 sentence summary of the customer's emotional state (e.g., highly frustrated, confused, neutral).")
    key_frustrations: List[str] = Field(description="Top 1 to 3 specific pain points extracted from their messages.")
    retention_strategy: str = Field(description="One highly actionable step the support team should take immediately to save this customer.")

class ChurnRequest(BaseModel):
    customer_history: str = Field(description="Recent support tickets, emails, or chat logs from the customer.")
    customer_tenure: str = Field(description="How long they have been a customer (e.g., '2 months', '3 years').")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/sales/churn-predictor")
def predict_churn(request: ChurnRequest):
    try:
        # The Elite Sentiment Logic
        sys_prompt = """You are an elite AI Customer Success Manager and Sentiment Analyst.
        Your job is to deeply analyze the customer's support history and predict if they are going to churn (cancel their subscription).
        Look for subtle cues: repeated issues, mentions of competitors, aggressive language, or sudden silence.
        Do not sugarcoat the risk. If they are angry, flag it as High risk.
        Strictly follow the JSON schema requested."""

        combined_content = f"CUSTOMER TENURE: {request.customer_tenure}\n\nSUPPORT TICKET HISTORY:\n{request.customer_history}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ChurnSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very low temp because we want precise, clinical sentiment analysis
            )
        )
        
        churn_data = json.loads(response.text)
        return {"prediction": churn_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}