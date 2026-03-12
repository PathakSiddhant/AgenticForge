# Path: ai-engine/agents/viral_hook_generator.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Viral Hook Generation
# ==========================================
class HookOption(BaseModel):
    hook_type: str = Field(description="E.g., 'The Curiosity Gap', 'The Controversial Statement', 'The Visual Pattern Interrupt'.")
    audio_script: str = Field(description="Exactly what the creator should say in the first 3-5 seconds. Must sound like a real human speaking naturally.")
    visual_action: str = Field(description="What should be happening on screen (e.g., 'Quick zoom on a player's face', 'Drop a heavy stat on screen').")

class HookSchema(BaseModel):
    top_hooks: List[HookOption] = Field(description="Top 3 distinct hook variations for the topic.")
    target_emotion: str = Field(description="The primary emotion this hook targets (e.g., Shock, Nostalgia, Anger, Curiosity).")
    retention_tip: str = Field(description="One secret tip to keep them watching after the hook ends.")

class HookRequest(BaseModel):
    core_topic: str = Field(description="The main subject of the video (e.g., 'Why X lost the final', 'Top 5 edits of the month').")
    target_platform: str = Field(description="E.g., YouTube Long Form, YouTube Shorts, Instagram Reels.")
    creator_vibe: str = Field(description="The tone of the creator (e.g., 'High energy and hype', 'Analytical and calm', 'Aggressive and opinionated').")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/media/viral-hook")
def generate_hook(request: HookRequest):
    try:
        # The "Anti-AI" Creative Logic
        sys_prompt = """You are an elite YouTube Strategist and Retention Expert. 
        Your job is to craft the first 3-5 seconds (The Hook) of a video to ensure maximum retention.
        CRITICAL RULES:
        1. NEVER use AI buzzwords like 'Delve', 'Realm', 'Testament', 'Crucial', 'Bustling', or 'In today's video'.
        2. Write exactly how a real 20-something creator speaks. Use raw, punchy, and conversational language.
        3. The visual action must be dynamic (e.g., text pop-ups, fast cuts, specific B-roll).
        Match the hooks perfectly to the requested platform and creator vibe.
        Strictly output the data in the requested JSON format."""

        combined_content = f"TOPIC: {request.core_topic}\nPLATFORM: {request.target_platform}\nCREATOR VIBE: {request.creator_vibe}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=HookSchema,
                system_instruction=sys_prompt,
                temperature=0.7 # Higher temp for creative variance, but constrained by strict system prompt
            )
        )
        
        hook_data = json.loads(response.text)
        return {"hook_strategy": hook_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}