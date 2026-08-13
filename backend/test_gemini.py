"""Test all models that support generateContent."""
import os
import sys
from dotenv import load_dotenv
load_dotenv()

from google import genai

api_key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)

# Models from list that support generateContent - try the newer ones first
test_models = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-pro-latest",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
]

for model in test_models:
    try:
        resp = client.models.generate_content(
            model=model,
            contents=["Say hello in one sentence."],
        )
        print(f"SUCCESS [{model}]: {resp.text.strip()[:80]}")
    except Exception as e:
        err = str(e)[:120]
        print(f"FAILED  [{model}]: {err}")
