# Path: ai-engine/agents/resume_screener.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: HR Scorecard
# ==========================================
class ResumeAnalysisSchema(BaseModel):
    match_score: int = Field(description="Match percentage between the resume and JD (0 to 100)")
    verdict: str = Field(description="Strictly output one: Strong Hire, Potential Hire, or Reject")
    key_strengths: List[str] = Field(description="Top 3 matching skills, qualifications, or experiences")
    missing_requirements: List[str] = Field(description="Critical skills or requirements from the JD that are missing in the resume")
    hr_notes: str = Field(description="A crisp, 2-sentence summary explaining the reasoning behind the verdict")

class ScreenerRequest(BaseModel):
    job_description: str
    resume_text: str

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/hr/resume-screener")
def screen_resume(request: ScreenerRequest):
    try:
        sys_prompt = """You are an elite, highly critical Technical HR Recruiter and ATS (Applicant Tracking System) AI.
        Your job is to ruthlessly evaluate the provided candidate resume against the provided Job Description (JD).
        Be objective. Do not hallucinate skills not explicitly mentioned in the resume. 
        Strictly output the evaluation in the requested JSON format."""

        combined_content = f"JOB DESCRIPTION (JD):\n{request.job_description}\n\nCANDIDATE RESUME:\n{request.resume_text}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeAnalysisSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very low temp for objective, factual evaluation
            )
        )
        
        screening_data = json.loads(response.text)
        return {"analysis": screening_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}