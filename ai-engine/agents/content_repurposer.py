# Path: ai-engine/agents/content_repurposer.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Content Repurposing
# ==========================================
class RepurposeSchema(BaseModel):
    twitter_thread: List[str] = Field(description="A 3 to 5 tweet thread. Must be punchy, use curiosity gaps, and avoid corporate jargon.")
    linkedin_post: str = Field(description="A story-driven LinkedIn post with strong spacing, a relatable hook, and a clear takeaway. No cringe 'hustle culture' cliches.")
    short_form_script: str = Field(description="A highly energetic 30-45 second script for TikTok/Reels/Shorts, complete with a visual hook and fast pacing.")

class RepurposeRequest(BaseModel):
    source_content: str = Field(description="The original long-form video script, article, or raw transcript.")
    core_message: str = Field(description="The single most important takeaway the creator wants to highlight across all platforms.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/media/content-repurposer")
def repurpose_content(request: RepurposeRequest):
    try:
        # The Omni-Channel Strategist Logic
        sys_prompt = """You are an elite Multi-Platform Content Strategist.
        Your job is to take long-form content and translate it into native formats for Twitter, LinkedIn, and Short-form video.
        
        CRITICAL RULES:
        1. X/Twitter: Short, polarizing, punchy. First tweet must be a massive hook. No hashtags.
        2. LinkedIn: Start with a personal/relatable hook. Use line breaks (whitespace). Focus on professional growth or lessons learned.
        3. Shorts/Reels: Fast-paced. Assume the viewer has a 2-second attention span. Include visual cues in brackets.
        4. NEVER use AI buzzwords like 'Delve', 'Realm', 'In conclusion', or 'Testament'. Keep it raw and human.
        
        Strictly output the data in the requested JSON format."""

        combined_content = f"CORE MESSAGE TO HIGHLIGHT: {request.core_message}\n\nSOURCE CONTENT:\n{request.source_content}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RepurposeSchema,
                system_instruction=sys_prompt,
                temperature=0.6 # Balance of creativity and strict format adherence
            )
        )
        
        repurpose_data = json.loads(response.text)
        return {"repurposed_content": repurpose_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}