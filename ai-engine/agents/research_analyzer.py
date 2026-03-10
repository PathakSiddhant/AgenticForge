# Path: ai-engine/agents/research_analyzer.py

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
# ENTERPRISE SCHEMA: Academic Paper Analysis
# ==========================================
class ResearchAnalysisSchema(BaseModel):
    paper_title: str = Field(description="The inferred or explicit title of the research paper.")
    core_methodology: str = Field(description="A 2-3 sentence summary of the exact methods, datasets, or frameworks used in the study.")
    key_findings: List[str] = Field(description="Top 3 to 5 critical results or discoveries made in the paper.")
    limitations: List[str] = Field(description="Any flaws, future work, or limitations explicitly mentioned by the authors.")
    tldr_summary: str = Field(description="A 'Too Long; Didn't Read' 1-paragraph summary for a general audience.")

# ==========================================
# THE AGENT ENDPOINT
# ==========================================
@router.post("/api/education/research-analyzer")
async def analyze_research_paper(
    focus_area: str = Form(default="General Overview"), # Optional query from user
    file: UploadFile = File(...)
):
    try:
        # 1. Python PDF Extraction
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        
        paper_text = ""
        # Limiting to first 10 pages to avoid massive token usage for heavy papers, 
        # usually methodology and findings are covered.
        num_pages = min(len(pdf_reader.pages), 10) 
        for i in range(num_pages):
            paper_text += pdf_reader.pages[i].extract_text() or ""
            
        if not paper_text.strip():
            return {"error": "PDF is empty or unreadable (might be a scanned image)."}

        # 2. The Academic AI Logic
        sys_prompt = """You are an elite Postdoctoral Research Assistant and Academic AI.
        Your task is to analyze the provided text from a research paper or academic article.
        Extract the core methodology, key findings, and limitations accurately.
        Do not hallucinate. If a section (like limitations) is completely missing, state 'Not explicitly mentioned in the text provided.'
        Strictly follow the requested JSON structure."""

        combined_content = f"USER FOCUS AREA:\n{focus_area}\n\nRESEARCH PAPER TEXT (Excerpt):\n{paper_text}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResearchAnalysisSchema,
                system_instruction=sys_prompt,
                temperature=0.1 # Keep it strictly factual
            )
        )
        
        analysis_data = json.loads(response.text)
        return {"analysis": analysis_data}
    
    except Exception as e:
        return {"error": f"Python Backend Error: {str(e)}"}