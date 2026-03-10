# Path: ai-engine/agents/earnings_rag.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# ENTERPRISE SCHEMA: RAG Analytics
# ==========================================
class EarningsResponseSchema(BaseModel):
    direct_answer: str = Field(description="A clear, professional answer strictly based on the provided text. If not found, say 'Information not present in the document.'")
    extracted_metrics: List[str] = Field(description="A list of key financial figures (e.g., $1.2B, 15% growth) related to the answer. Empty if none.")
    confidence_level: str = Field(description="Strictly output: High, Medium, or Low based on how explicitly the text answers the question.")

class EarningsRequest(BaseModel):
    document_text: str  # User paste karega 10-K ya earnings report ka text
    query: str          # User ka sawal

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/finance/earnings-rag")
def analyze_earnings(request: EarningsRequest):
    try:
        sys_prompt = """You are an elite SEC Financial Auditor and AI Reader.
        You are provided with an excerpt from a company's earnings report/financial statement and a user query.
        RULE 1: Answer strictly using ONLY the provided document. No outside knowledge.
        RULE 2: Extract specific numbers and metrics to back up your answer.
        RULE 3: Return the exact JSON format requested."""

        combined_content = f"FINANCIAL DOCUMENT:\n{request.document_text}\n\nUSER QUERY:\n{request.query}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EarningsResponseSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Very low temp to prevent any hallucinations
            )
        )
        
        rag_data = json.loads(response.text)
        return {"analysis": rag_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}