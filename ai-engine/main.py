import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# 1. .env file se tera secret API key load kar rahe hain
load_dotenv()

# 2. Gemini AI ko configure kar rahe hain
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# Hum fast aur efficient model use kar rahe hain
model = genai.GenerativeModel('gemini-2.5-flash') 

app = FastAPI()

# CORS setup (Taaki Next.js aur Python baat kar sakein)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Pydantic BaseModel: Ye define karta hai ki Next.js se data kis format mein aayega
class ChatRequest(BaseModel):
    message: str

# 4. Asli AI Endpoint (POST Request)
@app.post("/chat")
def chat_with_ai(request: ChatRequest):
    try:
        # User ka message Gemini ko bhej rahe hain
        response = model.generate_content(request.message)
        # Gemini ka answer wapas Next.js ko bhej rahe hain
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Error aa gaya bhai: {str(e)}"}