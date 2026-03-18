# Path: ai-engine/agents/lead_scorer.py
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def score_lead_with_ai(lead_data: dict) -> dict:
    """
    Takes raw lead data, feeds it to Gemini, and returns a structured JSON 
    with score, status, and reasoning.
    """
    print(f"🤖 [AI Engine] Analyzing Lead: {lead_data.get('name')}...")
    
    # 🌟 THE MASTER PROMPT (The Brain of your System)
    prompt = f"""
    You are an elite, ruthless AI Sales Development Representative (SDR) for 'AgenticForge', 
    a company that builds custom $10,000+ AI automation systems for enterprises.
    
    Your job is to analyze inbound leads and qualify them. Be strict. Do not give high scores to broke or casual leads.
    
    SCORING LOGIC (0-100):
    - Budget: High budget ($10k+) = +40 points, Medium = +20, Low/Under $1k = -20 points.
    - Timeline: ASAP = +30 points, 1-3 months = +15, Just exploring = -10.
    - Company Size: Enterprise (200+) = +20 points, Startups (1-10) = 0 points.
    - Pain Point: Clear need for automation/workflows = +10 points. Generic answers = 0.
    
    STATUS ROUTING:
    - Score 75 to 100 -> "Hot" (Ready to close, schedule meeting)
    - Score 40 to 74 -> "Warm" (Needs nurturing, RAG Q&A)
    - Score < 40 -> "Cold" (Junk, students, or zero budget - send to newsletter)
    
    HERE IS THE LEAD DATA:
    {json.dumps(lead_data, indent=2)}
    
    OUTPUT FORMAT:
    You must return ONLY a valid raw JSON object. Do not use markdown blocks like ```json.
    Structure:
    {{
        "score": <integer>,
        "status": "<Hot, Warm, or Cold>",
        "reasoning": "<1 sentence explaining exactly why you gave this score>"
    }}
    """
    
    try:
        # Using Gemini 1.5 Flash for fast real-time processing
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Clean the response just in case Gemini adds markdown backticks
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text.replace("```", "").strip()
            
        ai_result = json.loads(raw_text)
        print(f"✅ [AI Engine] Result: {ai_result['status']} ({ai_result['score']}/100) - {ai_result['reasoning']}")
        return ai_result
        
    except Exception as e:
        print(f"❌ [AI Engine] Failed to score lead: {e}")
        # Fallback response in case AI fails
        return {
            "score": 0,
            "status": "New",
            "reasoning": "AI Scoring failed. Manual review required."
        }

# For quick local testing of this agent
if __name__ == "__main__":
    dummy_lead = {
        "name": "Tony Stark",
        "company_name": "Stark Industries",
        "company_size": "200+",
        "budget": "$10k+",
        "timeline": "ASAP",
        "pain_point": "My manual processes are slow, need an AI booking system today."
    }
    print(score_lead_with_ai(dummy_lead))