# Path: ai-engine/agents/data_structurer.py

import json
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types

# Ye Router ek chota server hai jo sirf is file ko manage karega
router = APIRouter()
client = genai.Client()

# Core Concept: Pydantic Schema
class PersonDataSchema(BaseModel):
    name: Optional[str] = Field(description="Name of the person mentioned in the text")
    age: Optional[int] = Field(description="Age of the person in numbers")
    profession: Optional[str] = Field(description="The job or profession of the person")
    skills: List[str] = Field(description="A list of technical or soft skills they have")
    summary: str = Field(description="A short 1-line professional summary of the user")

class StructureRequest(BaseModel):
    message: str

# End point wahi hai, bas @app ki jagah @router lag gaya
@router.post("/api/structure")
def structure_data(request: StructureRequest):
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.message,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PersonDataSchema,
                system_instruction="You are an expert Data Extraction Agent. Analyze the user's messy text and extract the required fields strictly in JSON format."
            ),
        )
        
        structured_data = json.loads(response.text)
        return {"structured_data": structured_data}
    
    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}