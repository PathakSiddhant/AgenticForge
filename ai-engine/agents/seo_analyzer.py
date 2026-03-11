# Path: ai-engine/agents/seo_analyzer.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: SEO Scorecard
# ==========================================
class SEOSchema(BaseModel):
    seo_score: int = Field(description="Overall SEO score out of 100 based on keyword usage, readability, and structure.")
    keyword_analysis: str = Field(description="A brief summary of how well the target keyword is utilized (density, placement in headers/intro).")
    missing_lsi_keywords: List[str] = Field(description="Top 5-7 semantic/related keywords (LSI) that are missing from the text but are crucial for ranking.")
    actionable_tips: List[str] = Field(description="Top 3 to 5 strict, actionable tips to improve the SEO score (e.g., 'Add target keyword to the first paragraph').")

class SEORequest(BaseModel):
    article_text: str
    target_keyword: str

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/sales/seo-analyzer")
def analyze_seo(request: SEORequest):
    try:
        # The Elite SEO Logic
        sys_prompt = """You are an elite, highly technical SEO Specialist and Content Auditor.
        Your job is to rigorously analyze the provided blog post/article against the target keyword.
        Do not flatter the writer. Be highly critical.
        Check for keyword stuffing, missing semantic context (LSI keywords), and structural flaws (H1/H2 usage).
        Strictly output the evaluation in the requested JSON format."""

        combined_content = f"TARGET KEYWORD:\n{request.target_keyword}\n\nARTICLE CONTENT:\n{request.article_text}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SEOSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Keep it strictly factual and analytical
            )
        )
        
        seo_data = json.loads(response.text)
        return {"audit": seo_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}