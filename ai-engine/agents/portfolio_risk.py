# Path: ai-engine/agents/portfolio_risk.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Portfolio Risk Dashboard
# ==========================================
class PortfolioRiskSchema(BaseModel):
    overall_risk_score: int = Field(description="Risk score out of 100. Higher means extremely risky.")
    risk_category: str = Field(description="Strictly output one: Conservative, Moderate, Aggressive, or Highly Speculative")
    diversity_health: str = Field(description="A 1-sentence analysis on whether the portfolio is well-diversified or concentrated.")
    vulnerabilities: List[str] = Field(description="Top 3 macroeconomic or sector-specific threats to this exact portfolio")
    rebalancing_recommendations: List[str] = Field(description="3 clear, actionable steps to optimize risk and reward")

class PortfolioRequest(BaseModel):
    holdings: str # User input: e.g., "50% Tesla, 30% Bitcoin, 20% Cash"
    market_outlook: str # User input: e.g., "Expecting a recession" or "Bull market"

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/finance/portfolio")
def analyze_portfolio(request: PortfolioRequest):
    try:
        sys_prompt = """You are an elite, highly conservative Wall Street Risk Manager and Wealth Advisor.
        Analyze the provided investment portfolio based on the user's market outlook.
        Identify concentration risks, sector vulnerabilities, and provide a brutally honest risk score and actionable rebalancing advice.
        Return the exact JSON structure requested."""

        prompt_content = f"PORTFOLIO HOLDINGS: {request.holdings}\nUSER'S MARKET OUTLOOK: {request.market_outlook}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PortfolioRiskSchema,
                system_instruction=sys_prompt,
                temperature=0.2 # Keep it analytical and grounded
            )
        )
        
        risk_data = json.loads(response.text)
        return {"analysis": risk_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}