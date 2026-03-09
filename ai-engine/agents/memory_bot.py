# Path: ai-engine/agents/memory_bot.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# 1. Frontend se aane wale history array ka format
class MessageItem(BaseModel):
    role: str      # Ya toh 'user' hoga ya 'model' (AI)
    content: str   # Message ka text

# 2. Asli Request ka format (Pichli history + Naya message)
class ChatMemoryRequest(BaseModel):
    history: List[MessageItem]
    message: str

@router.post("/api/memory")
def chat_with_memory(request: ChatMemoryRequest):
    try:
        # Step A: Frontend ki history ko Gemini ke samajhne wale format mein convert karna
        formatted_history = []
        for msg in request.history:
            formatted_history.append(
                types.Content(role=msg.role, parts=[types.Part.from_text(text=msg.content)])
            )

        # Step B: AI ka ek "Chat Session" start karna purani memory ke saath
        chat = client.chats.create(
            model='gemini-2.5-flash',
            config=types.GenerateContentConfig(
                system_instruction="You are a friendly AI assistant with perfect session memory. Always pay attention to the user's past messages in this conversation.",
                temperature=0.7
            ),
            history=formatted_history
        )

        # Step C: Naya message bhejna aur jawab lena
        response = chat.send_message(request.message)

        return {"reply": response.text}

    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}