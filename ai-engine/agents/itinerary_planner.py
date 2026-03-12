# Path: ai-engine/agents/itinerary_planner.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Travel Itinerary
# ==========================================
class Activity(BaseModel):
    time: str = Field(description="Time of day (e.g., '09:00 AM').")
    activity_name: str = Field(description="Specific name of the place or activity.")
    description: str = Field(description="Why this fits the user's vibe.")
    estimated_cost_usd: int = Field(description="Realistic estimated cost in USD based on historical data.")

class DayPlan(BaseModel):
    day_number: int
    daily_theme: str = Field(description="Theme for the day (e.g., 'Culture & Temples', 'Extreme Water Sports').")
    activities: List[Activity]
    total_daily_cost: int = Field(description="Sum of all activity costs for this day.")

class ItinerarySchema(BaseModel):
    destination: str
    vibe_match_score: int = Field(description="Score out of 100 on how well this matches the user's requested vibe.")
    total_estimated_budget: int = Field(description="Total cost for all days (excluding flights).")
    itinerary: List[DayPlan]
    expert_tip: str = Field(description="One critical local tip for this specific destination.")

class TravelRequest(BaseModel):
    destination: str = Field(description="Where is the user going?")
    days: int = Field(description="Number of days.")
    budget_level: str = Field(description="E.g., 'Backpacker', 'Mid-Range', 'Luxury'.")
    vibe: str = Field(description="E.g., 'Relaxation and Spa', 'Hardcore Party', 'Historical Exploration'.")

# ==========================================
# THE AGENT ENDPOINT (Predictive Mode)
# ==========================================
@router.post("/api/travel/itinerary-planner")
def generate_itinerary(request: TravelRequest):
    try:
        # The Elite Travel Concierge Logic
        sys_prompt = """You are a luxury travel concierge AI. Your job is to create a highly specific, realistic day-by-day itinerary.
        CRITICAL RULES:
        1. PREDICTIVE PRICING: You do not have live APIs, so use your knowledge of current economic pricing to estimate realistic USD costs for the specified budget level.
        2. NO GENERIC ADVICE: Do not say 'Visit a local beach'. Say 'Visit Padang Padang Beach for sunset'.
        3. VIBE MATCH: Strictly adhere to the requested vibe. If they want 'Hardcore Party', do not schedule 6 AM temple visits.
        4. MATH CHECK: Ensure the total_daily_cost matches the sum of activities, and total_estimated_budget matches the sum of all days.
        
        Strictly output the data in the requested JSON format."""

        combined_content = f"DESTINATION: {request.destination}\nDAYS: {request.days}\nBUDGET LEVEL: {request.budget_level}\nVIBE: {request.vibe}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ItinerarySchema,
                system_instruction=sys_prompt,
                temperature=0.4 # Lower temp for better math and realistic places
            )
        )
        
        travel_data = json.loads(response.text)
        return {"travel_plan": travel_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}