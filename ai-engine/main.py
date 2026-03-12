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
from agents import interview_planner
from agents import onboarding_rag

# Agents (Education and Research)
from agents import research_analyzer
from agents import edu_planner
from agents import essay_evaluator

# Agents (Sales & Marketing)
from agents import cold_outreach
from agents import seo_analyzer
from agents import churn_predictor

# Agents (Customer Support)
from agents import ticket_router
from agents import auto_responder
from agents import refund_automator

# Agents (Logistics & Supply Chain)
from agents import inventory_forecaster
from agents import supplier_risk
from agents import freight_optimizer

# Agents (Media & Content Agency)
from agents import viral_hook_generator
from agents import raw_scriptwriter

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
app.include_router(interview_planner.router)
app.include_router(onboarding_rag.router)

# Routing Edu-Research
app.include_router(research_analyzer.router)
app.include_router(edu_planner.router)
app.include_router(essay_evaluator.router)

# Routing Sales
app.include_router(cold_outreach.router)
app.include_router(seo_analyzer.router)
app.include_router(churn_predictor.router)

# Routing Support
app.include_router(ticket_router.router)
app.include_router(auto_responder.router)
app.include_router(refund_automator.router)

# Routing Logistics
app.include_router(inventory_forecaster.router)
app.include_router(supplier_risk.router)
app.include_router(freight_optimizer.router)

# Routing Media
app.include_router(viral_hook_generator.router)
app.include_router(raw_scriptwriter.router)

@app.get("/")
def health_check():
    return {"status": "AI Engine is running perfectly!"}