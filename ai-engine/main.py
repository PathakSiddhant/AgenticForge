# Path: ai-engine/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Agents (Base)
from agents import data_structurer
from agents import memory_bot
from agents import tool_caller
from agents import document_reader

# Agents (Finance)
from agents import market_intel
from agents import portfolio_risk
from agents import earnings_rag

# Agents (HR)
from agents import resume_screener

app = FastAPI(title="AgenticForge API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routing Base
app.include_router(data_structurer.router)
app.include_router(memory_bot.router)
app.include_router(tool_caller.router)
app.include_router(document_reader.router)

# Routing Finance
app.include_router(market_intel.router)
app.include_router(portfolio_risk.router)
app.include_router(earnings_rag.router)

# Routing HR
app.include_router(resume_screener.router)

@app.get("/")
def health_check():
    return {"status": "AI Engine is running perfectly!"}