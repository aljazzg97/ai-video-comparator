import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("Models available to your API key:")
for model in client.models.list():
    if "gemini" in model.name.lower():
        print(f"  {model.name}")