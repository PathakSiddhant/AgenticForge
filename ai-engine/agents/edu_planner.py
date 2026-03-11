# Path: ai-engine/agents/edu_planner.py

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
# ENTERPRISE SCHEMA: EdTech Learning Path
# ==========================================
class StudyDay(BaseModel):
    day: str = Field(description="e.g., Day 1, Day 2, etc.")
    topics_to_cover: str = Field(description="A crisp summary of what needs to be studied on this day.")

class Flashcard(BaseModel):
    concept: str = Field(description="The key term or concept.")
    definition: str = Field(description="A clear, 1-sentence explanation.")

class MCQ(BaseModel):
    question: str = Field(description="A challenging multiple-choice question.")
    options: List[str] = Field(description="Exactly 4 options for the MCQ.")
    correct_answer: str = Field(description="The exact string of the correct option.")
    explanation: str = Field(description="Why this answer is correct.")

class EduPlanSchema(BaseModel):
    study_plan: List[StudyDay] = Field(description="A structured timeline to complete the material.")
    flashcards: List[Flashcard] = Field(description="Top 5-7 flashcards for quick revision.")
    mcq_quiz: List[MCQ] = Field(description="A test consisting of 3-5 multiple choice questions.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/education/edu-planner")
async def generate_edu_plan(
    timeframe: str = Form(default="7 Days"), # User can specify how many days they have
    file: UploadFile = File(...)
):
    try:
        # 1. Python PDF Extraction
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        
        material_text = ""
        # Limiting to 15 pages to keep context clean and focused
        num_pages = min(len(pdf_reader.pages), 15) 
        for i in range(num_pages):
            material_text += pdf_reader.pages[i].extract_text() or ""
            
        if not material_text.strip():
            return {"error": "PDF is empty or unreadable."}

        # 2. The AI Curriculum Designer
        sys_prompt = f"""You are an elite EdTech Curriculum Designer and AI Tutor.
        The user has provided their study material (PDF text) and a target timeframe of {timeframe}.
        Your job is to break down this material and create an engaging learning path.
        Generate a realistic day-by-day study plan, critical flashcards, and a challenging MCQ quiz.
        Ensure the 'options' array in MCQs always contains exactly 4 distinct choices.
        Strictly follow the JSON schema."""

        combined_content = f"STUDY MATERIAL (Excerpt):\n{material_text}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EduPlanSchema,
                system_instruction=sys_prompt,
                temperature=0.2 # Slight creativity allowed for question generation
            )
        )
        
        plan_data = json.loads(response.text)
        return {"plan": plan_data}
    
    except Exception as e:
        return {"error": f"Python Backend Error: {str(e)}"}