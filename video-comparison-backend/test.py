import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
print("Key loaded:", bool(api_key))

client = genai.Client(api_key=api_key)
response = client.models.generate_content(
    model="gemini-1.5-flash",
    contents="Say 'Hello from Gemini!'"
)
print(response.text)