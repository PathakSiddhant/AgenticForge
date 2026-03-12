# Path: ai-engine/agents/freight_optimizer.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Freight Optimization
# ==========================================
class RouteSchema(BaseModel):
    recommended_carrier: str = Field(description="The best shipping carrier for this route (e.g., FedEx, UPS, DHL, Local Freight).")
    estimated_cost_usd: float = Field(description="The estimated cost in USD to ship this package.")
    estimated_transit_days: int = Field(description="Expected number of days for delivery.")
    optimization_reasoning: str = Field(description="A brief explanation of WHY this carrier and route was chosen (balancing cost vs speed).")

class RouteRequest(BaseModel):
    origin: str = Field(description="Starting city and zip code.")
    destination: str = Field(description="Destination city and zip code.")
    package_weight_kg: float = Field(description="Weight of the package in kilograms.")
    priority_level: str = Field(description="Strictly: Standard, Express, or Overnight.")
    special_handling: str = Field(description="Any special needs (e.g., 'Fragile', 'Refrigerated', 'None').", default="None")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/logistics/freight-optimizer")
def optimize_freight(request: RouteRequest):
    try:
        # The Objective Routing Logic
        sys_prompt = """You are an elite AI Freight and Logistics Optimizer.
        Your job is to select the absolute best shipping carrier and route based on the origin, destination, weight, and priority.
        - 'Overnight' priority ignores high costs to ensure speed.
        - 'Standard' priority strictly minimizes cost over speed.
        - If 'special_handling' is Refrigerated or Fragile, select a premium carrier and adjust the cost higher.
        Provide realistic estimated costs (USD) and transit times.
        Strictly output the data in the requested JSON format."""

        combined_content = f"ORIGIN: {request.origin}\nDESTINATION: {request.destination}\nWEIGHT: {request.package_weight_kg} kg\nPRIORITY: {request.priority_level}\nSPECIAL HANDLING: {request.special_handling}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RouteSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very objective and deterministic
            )
        )
        
        route_data = json.loads(response.text)
        return {"route_optimization": route_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}