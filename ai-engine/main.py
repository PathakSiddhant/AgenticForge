# Path: ai-engine/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. SABSE PEHLE ENVIRONMENT VARIABLES LOAD KARO!
load_dotenv()

# 2. USKE BAAD AGENTS IMPORT KARO (Taaki unhe API key mil jaye)
from agents import data_structurer
from agents import memory_bot
from agents import tool_caller

# The Captain (Main App)
app = FastAPI(title="AgenticForge API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routing
app.include_router(data_structurer.router)
app.include_router(memory_bot.router)
app.include_router(tool_caller.router)

@app.get("/")
def health_check():
    return {"status": "AI Engine is running perfectly!"}