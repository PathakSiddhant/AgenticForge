# Path: ai-engine/agents/document_reader.py

from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# Request mein hum Context (Paragraph) aur Question dono mangenge
class DocumentRequest(BaseModel):
    document_text: str
    question: str

@router.post("/api/read")
def read_and_answer(request: DocumentRequest):
    try:
        # Strict System Prompt (Yahi RAG ki jaan hoti hai)
        sys_prompt = """You are a strict Document Q&A Assistant. 
        You will be provided with a source document and a user's question.
        Rule 1: Answer the question based ONLY on the provided document.
        Rule 2: Do not use your external knowledge.
        Rule 3: If the answer is not found in the text, reply EXACTLY with: 'I cannot find the answer in the provided document.'"""

        # Context aur question ko combine kar rahe hain
        combined_prompt = f"SOURCE DOCUMENT:\n{request.document_text}\n\nQUESTION:\n{request.question}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=combined_prompt,
            config=types.GenerateContentConfig(
                system_instruction=sys_prompt,
                temperature=0.1 # Low temperature taaki AI creative na ho, strictly facts pe rahe
            )
        )

        return {"reply": response.text}

    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}