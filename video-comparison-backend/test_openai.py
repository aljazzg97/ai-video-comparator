import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Say 'API key works!'"}],
        max_tokens=20
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", e)