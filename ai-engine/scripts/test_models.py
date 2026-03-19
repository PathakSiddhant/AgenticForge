import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env") # Make sure path is correct
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Available Embedding Models:")
for m in genai.list_models():
  if 'embedContent' in m.supported_generation_methods:
    print(m.name)