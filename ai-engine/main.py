from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Ye raha tera CORS setup!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js ka address allow kar diya
    allow_credentials=True,
    allow_methods=["*"], # GET, POST sab allow kar diya
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Success", "message": "AgenticForge Backend is Running! Bhai phod denge!"}