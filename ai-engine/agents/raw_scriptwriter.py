# Path: ai-engine/agents/raw_scriptwriter.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Raw Script Generation
# ==========================================
class ScriptSchema(BaseModel):
    video_title_ideas: List[str] = Field(description="3 click-worthy, highly clickable title ideas for this video.")
    full_script: str = Field(description="The complete, word-for-word script. Includes visual cues in brackets like [Zoom in] or [B-roll of match].")
    pacing_notes: str = Field(description="Advice on how fast or slow the creator should speak during different sections of the video.")

class ScriptRequest(BaseModel):
    core_topic: str = Field(description="The main subject of the video.")
    approved_hook: str = Field(description="The 3-5 second hook to start the video with.")
    target_length_minutes: float = Field(description="Approximate length of the video in minutes.")
    creator_vibe: str = Field(description="The tone of the creator (e.g., 'Aggressive sports fan', 'Calm storyteller').")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/media/raw-scriptwriter")
def generate_script(request: ScriptRequest):
    try:
        # The "Anti-AI" Storyteller Logic
        sys_prompt = """You are an elite, highly-paid YouTube Scriptwriter. 
        Your job is to write a full video script based on the provided topic, hook, and target length.
        
        CRITICAL RULES FOR "ANTI-AI" TONE:
        1. NEVER use words like: 'Delve', 'Realm', 'Testament', 'Crucial', 'Bustling', 'In conclusion', 'Let's dive right in', 'Picture this'.
        2. Write exactly how a real human speaks. Use short sentences, pauses (...), and conversational slang if it fits the vibe.
        3. Break the script into clear sections: [INTRO], [BUILD-UP], [THE MEAT], [CLIMAX], [OUTRO/CTA].
        4. Include bracketed visual cues for the editor: e.g., [Cut to heavy bass drop], [Fast zoom on his face].
        5. Assume an average speaking rate of 150 words per minute to calculate the script length.
        
        Strictly output the data in the requested JSON format."""

        combined_content = f"TOPIC: {request.core_topic}\nSTARTING HOOK: {request.approved_hook}\nTARGET LENGTH: {request.target_length_minutes} minutes\nCREATOR VIBE: {request.creator_vibe}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ScriptSchema,
                system_instruction=sys_prompt,
                temperature=0.6 # Good balance of creativity and structure
            )
        )
        
        script_data = json.loads(response.text)
        return {"script_content": script_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}