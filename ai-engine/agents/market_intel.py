# Path: ai-engine/agents/market_intel.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# THE ENTERPRISE SCHEMA (Dashboard ka Blueprint)
# ==========================================
class SWOT(BaseModel):
    strengths: List[str] = Field(description="3 core strengths of the company")
    weaknesses: List[str] = Field(description="3 critical weaknesses")
    opportunities: List[str] = Field(description="2 future growth opportunities")
    threats: List[str] = Field(description="2 major market threats")

class MarketIntelSchema(BaseModel):
    company_name: str
    industry: str
    market_sentiment: str = Field(description="Strictly output either: Bullish, Bearish, or Neutral")
    key_competitors: List[str] = Field(description="Top 3 direct competitors")
    swot_analysis: SWOT
    executive_summary: str = Field(description="A crisp, 2-sentence professional summary of the company's current market position.")

class IntelRequest(BaseModel):
    company: str

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/finance/intel")
def generate_market_intel(request: IntelRequest):
    try:
        sys_prompt = """You are an elite Wall Street Financial Analyst AI.
        Analyze the requested company/startup and provide a comprehensive, highly accurate market intelligence report.
        You must STRICTLY return the data in the requested JSON format. Be objective and data-driven."""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Generate a market intelligence report for: {request.company}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MarketIntelSchema, # Badi boundary set kar di
                system_instruction=sys_prompt,
                temperature=0.2 # Low temperature taaki analytical aur serious rahe
            )
        )
        
        intel_data = json.loads(response.text)
        return {"intel": intel_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}