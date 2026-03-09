import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Naya import syntax
from google import genai 

# 1. .env file se secret API key load kar rahe hain
load_dotenv()

# 2. Naye SDK ke hisaab se Client initialize karna
# Ye automatically teri .env se GEMINI_API_KEY utha lega
client = genai.Client() 

app = FastAPI()

# CORS setup 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Pydantic BaseModel
class ChatRequest(BaseModel):
    message: str

# 4. Asli AI Endpoint (POST Request)
@app.post("/chat")
def chat_with_ai(request: ChatRequest):
    try:
        # Naye client ke through model call karna
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.message,
        )
        # Naye SDK mein response.text bilkul same kaam karta hai
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Error aa gaya bhai: {str(e)}"}