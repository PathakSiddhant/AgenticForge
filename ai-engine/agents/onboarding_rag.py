# Path: ai-engine/agents/onboarding_rag.py

import json
import io
import PyPDF2
from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: Onboarding Q&A
# ==========================================
class OnboardingResponseSchema(BaseModel):
    answer: str = Field(description="A clear, polite, and helpful answer to the employee's query, strictly based on the provided document.")
    policy_reference: str = Field(description="A short quote or section name from the text that proves the answer. E.g., 'As per Section 3.1: Leave Policy'. If not found, output 'No direct reference'.")
    confidence: str = Field(description="Strictly output: High, Medium, or Low based on how explicitly the document answers the query.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/hr/onboarding-rag")
async def answer_employee_query(
    query: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # 1. Python PDF Extraction
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        
        document_text = ""
        for page in pdf_reader.pages:
            document_text += page.extract_text() or ""
            
        if not document_text.strip():
            return {"error": "PDF se text nahi nikal paya. Invalid or scanned file."}

        # 2. The RAG Policy AI
        sys_prompt = """You are a helpful and professional Corporate HR Onboarding Assistant.
        You are provided with a company policy document (PDF text) and a new employee's query.
        RULE 1: Answer strictly using ONLY the provided document. NEVER use outside knowledge.
        RULE 2: Be polite and welcoming.
        RULE 3: If the answer is not in the document, politely say 'I cannot find this information in the provided manual. Please contact HR.'
        RULE 4: Return the exact JSON structure requested."""

        combined_content = f"COMPANY MANUAL / POLICY DOCUMENT:\n{document_text}\n\nEMPLOYEE QUERY:\n{query}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=OnboardingResponseSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Low temp to prevent policy hallucination
            )
        )
        
        onboarding_data = json.loads(response.text)
        return {"response": onboarding_data}
    
    except Exception as e:
        return {"error": f"Python Backend Error: {str(e)}"}