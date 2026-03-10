# Path: ai-engine/agents/interview_planner.py

import json
import io
import PyPDF2
from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Interview Plan
# ==========================================
class Question(BaseModel):
    question: str = Field(description="A highly specific interview question based on the resume claims.")
    expected_answer: str = Field(description="Key technical or behavioral points the interviewer should look for in a good answer.")

class InterviewPlanSchema(BaseModel):
    technical_questions: List[Question] = Field(description="3 to 5 deep technical questions tailored to verify the candidate's exact resume claims against the JD.")
    behavioral_questions: List[Question] = Field(description="2 behavioral or cultural fit questions.")
    red_flags_to_probe: List[str] = Field(description="Areas in the resume that look vague, exaggerated, or require deep probing (e.g., employment gaps, 'assisted with' claims).")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/hr/interview-planner")
async def plan_interview(
    job_description: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # 1. Python PDF Extraction
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        
        resume_text = ""
        for page in pdf_reader.pages:
            resume_text += page.extract_text() or ""
            
        if not resume_text.strip():
            return {"error": "PDF se text nahi nikal paya. Invalid file."}

        # 2. The AI Interrogator Logic
        sys_prompt = """You are an elite, highly technical Hiring Manager and Interview Architect.
        Analyze the candidate's resume against the Job Description. 
        Generate a tough, highly customized interview plan. Do not ask generic questions. 
        Ask questions that specifically test the claims made in their resume.
        Identify any red flags or vague statements that the interviewer must probe deeply."""

        combined_content = f"JOB DESCRIPTION:\n{job_description}\n\nCANDIDATE RESUME:\n{resume_text}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=InterviewPlanSchema,
                system_instruction=sys_prompt,
                temperature=0.3 # Slightly higher temp for creative, tough questions
            )
        )
        
        interview_data = json.loads(response.text)
        return {"plan": interview_data}
    
    except Exception as e:
        return {"error": f"Python Backend Error: {str(e)}"}