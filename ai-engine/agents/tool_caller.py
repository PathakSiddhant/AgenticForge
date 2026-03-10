# Path: ai-engine/agents/tool_caller.py

from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from google.genai import types

router = APIRouter()
client = genai.Client()

# ==========================================
# THE TOOL: Ye humara nakli API / Database hai
# ==========================================
def get_crypto_price(coin_name: str) -> str:
    """Fetches the live price of a given cryptocurrency."""
    # Real world mein yahan hum Binance ya CoinMarketCap ki API call karenge
    prices = {
        "bitcoin": "$65,430", 
        "ethereum": "$3,520", 
        "solana": "$145", 
        "dogecoin": "$0.16"
    }
    coin = coin_name.lower()
    if coin in prices:
        return f"The current price of {coin} is {prices[coin]}."
    return f"Sorry, live data for {coin} is not available right now."

# Request format
class ToolRequest(BaseModel):
    message: str

@router.post("/api/tool")
def run_tool_agent(request: ToolRequest):
    try:
        # Hum ek chat session start kar rahe hain jisme AI ko humne tool pakda diya hai
        chat = client.chats.create(
            model='gemini-2.5-flash',
            config=types.GenerateContentConfig(
                tools=[get_crypto_price], # <--- MAGIC HAPPENS HERE: AI ko tool de diya
                temperature=0.3,
                system_instruction="You are an intelligent Crypto Assistant. ALWAYS use the 'get_crypto_price' tool if the user asks for a coin's price. If they ask a general question, answer normally."
            )
        )

        # AI ko message bhejenge. Naya SDK automatically check karega ki tool ki zaroorat hai ya nahi,
        # agar hogi toh function chalayega aur final answer return karega.
        response = chat.send_message(request.message)

        return {"reply": response.text}

    except Exception as e:
        return {"error": f"Backend Error: {str(e)}"}