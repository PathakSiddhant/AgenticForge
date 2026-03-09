# Path: ai-engine/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Apne naye agent ko import kar rahe hain
from agents import data_structurer

# Environment variables (API Key) load karo
load_dotenv()

# The Captain (Main App)
app = FastAPI(title="AgenticForge API Engine")

# Security Rules (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ROUTING: Captain bol raha hai ki "/api/structure" pe koi aaye toh use kahan bhejna hai
# ==========================================
app.include_router(data_structurer.router)

# Kal ko jab hum HR Agent banayenge, toh bas yahan ek line aur add hogi:
# app.include_router(hr_agent.router)

@app.get("/")
def health_check():
    return {"status": "AI Engine is running perfectly!"}