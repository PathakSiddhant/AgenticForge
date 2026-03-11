# Path: ai-engine/agents/essay_evaluator.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Essay Scorecard
# ==========================================
class EssayEvaluationSchema(BaseModel):
    score: int = Field(description="Final grade out of 100 based on the rubric.")
    overall_verdict: str = Field(description="A 2-sentence summary of the essay's overall quality.")
    grammar_and_spelling: List[str] = Field(description="List of specific grammatical or spelling errors found. Empty if perfect.")
    structural_feedback: str = Field(description="Feedback on the essay's structure, flow, introduction, and conclusion.")
    improvement_tips: List[str] = Field(description="Top 3 actionable tips for the student to improve this essay.")

class EvaluationRequest(BaseModel):
    essay_text: str
    grading_criteria: str

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/education/essay-evaluator")
def evaluate_essay(request: EvaluationRequest):
    try:
        # 1. The Strict Examiner Logic
        sys_prompt = """You are an elite, highly objective Academic Professor and Essay Grader.
        Your job is to ruthlessly but fairly evaluate the provided student essay based on the given grading criteria/rubric.
        Do not flatter the student. Be highly specific about grammatical errors and structural flaws.
        Strictly output the evaluation in the requested JSON format."""

        combined_content = f"GRADING CRITERIA / RUBRIC:\n{request.grading_criteria}\n\nSTUDENT ESSAY:\n{request.essay_text}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EssayEvaluationSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very low temp for objective, factual grading
            )
        )
        
        evaluation_data = json.loads(response.text)
        return {"evaluation": evaluation_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}