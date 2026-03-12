# Path: ai-engine/agents/inventory_forecaster.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Inventory Forecasting
# ==========================================
class ForecastSchema(BaseModel):
    recommended_order_quantity: int = Field(description="The exact number of units to order right now to maintain optimal stock levels.")
    stockout_risk: str = Field(description="Strictly output: High, Medium, or Low based on current trajectory and lead time.")
    estimated_depletion_days: int = Field(description="How many days until the current stock runs out completely.")
    strategic_reasoning: str = Field(description="A crisp, data-driven explanation of WHY this specific quantity is recommended.")

class ForecastRequest(BaseModel):
    item_name: str = Field(description="The name of the material or product.")
    current_stock: int = Field(description="How many units are currently sitting in the warehouse.")
    historical_daily_usage: str = Field(description="Average units consumed/sold per day over the last few weeks.")
    supplier_lead_time_days: int = Field(description="How many days it takes for new stock to arrive after ordering.")
    market_conditions: str = Field(description="Any upcoming events, seasonality, or spikes in demand (e.g., 'Upcoming Diwali sale', 'Monsoon season').", default="Normal operations")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/logistics/inventory-forecaster")
def forecast_inventory(request: ForecastRequest):
    try:
        # The Objective Supply Chain Logic
        sys_prompt = """You are an elite Supply Chain & Inventory AI.
        Your job is to prevent stockouts while minimizing excess inventory holding costs.
        Analyze the daily usage, current stock, and supplier lead time to predict exactly when the stock will deplete.
        Factor in the provided market conditions to adjust the recommended order quantity safely.
        Do not hallucinate numbers; base your math on the provided inputs.
        Strictly output the data in the requested JSON format."""

        combined_content = f"ITEM: {request.item_name}\nCURRENT STOCK: {request.current_stock} units\nAVG DAILY USAGE: {request.historical_daily_usage}\nLEAD TIME: {request.supplier_lead_time_days} days\nCONDITIONS: {request.market_conditions}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ForecastSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very low temp for mathematical and logical precision
            )
        )
        
        forecast_data = json.loads(response.text)
        return {"forecast": forecast_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}