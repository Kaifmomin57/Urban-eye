"""Quick script to list all available Gemini models for this API key."""
import os
from dotenv import load_dotenv
load_dotenv()

from google import genai

api_key = os.getenv("GEMINI_API_KEY", "")
print(f"Using API key prefix: {api_key[:10]}...")

client = genai.Client(api_key=api_key)

print("\n=== Available Gemini Models ===")
try:
    models = client.models.list()
    gemini_models = []
    for m in models:
        if "gemini" in m.name.lower():
            # Check if generateContent is supported
            methods = getattr(m, 'supported_actions', None) or getattr(m, 'supported_generation_methods', [])
            gemini_models.append((m.name, methods))
            print(f"  {m.name}   | methods: {methods}")
    print(f"\nTotal Gemini models found: {len(gemini_models)}")
except Exception as e:
    print(f"Error listing models: {e}")
