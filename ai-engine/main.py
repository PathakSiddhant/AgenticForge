from fastapi import FastAPI

# Ye app object tere poore backend ko control karega
app = FastAPI()

# Ye ek 'endpoint' hai. Jab Next.js yahan request bhejega, toh ye response jayega.
@app.get("/")
def read_root():
    return {"status": "Success", "message": "AgenticForge Backend is Running! Bhai phod denge!"}