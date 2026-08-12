import os
import json
import base64
import warnings
from io import BytesIO
from PIL import Image

warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    genai.configure(api_key=GEMINI_API_KEY)

async def analyze_issue_with_ai(image_bytes: bytes | None, description: str, category: str, location: str) -> dict:
    """
    Analyzes an issue's image + description using Gemini Vision API.
    Returns structured priority score (1-100), risk assessment, category verification, and SLA hours.
    """
    # Default fallback response
    fallback = {
        "ai_score": 65 if category in ["Utilities", "Safety"] else 45,
        "priority": "critical" if category == "Safety" else ("high" if category == "Utilities" else "medium"),
        "suggested_category": category,
        "summary": f"Civic issue reported in {location} regarding {category.lower()}: {description[:120]}...",
        "risk_assessment": f"Standard civic issue in {category}. Regular dispatch recommended.",
        "citizen_impact_score": 60,
        "recommended_action": f"Deploy {category} maintenance team for inspection within 24 hours.",
        "suggested_sla_hours": 12 if category == "Safety" else 24
    }

    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("[AI Service] Gemini API key not configured. Using rule-based analyzer fallback.")
        return fallback

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = f"""
        You are an expert Smart City AI Inspector for Urban Eye. Analyze the following civic complaint details and optional image.

        Issue Description: "{description}"
        Reported Category: "{category}"
        Location: "{location}"

        Provide a JSON response ONLY with the following exact keys:
        - "ai_score": integer from 1 to 100 representing hazard severity and urgency
        - "priority": string, one of "critical", "high", "medium", "low"
        - "suggested_category": string, verified category ("Infrastructure", "Utilities", "Safety", "Environment", "Public Spaces")
        - "summary": string, 2-sentence formal technical summary of the issue
        - "risk_assessment": string, assessment of risk to citizens, traffic, or infrastructure
        - "citizen_impact_score": integer from 1 to 100
        - "recommended_action": string, recommended municipal squad action
        - "suggested_sla_hours": integer (e.g. 4 for critical, 12 for high, 24 for medium, 48 for low)
        """

        content = [prompt]

        if image_bytes:
            image = Image.open(BytesIO(image_bytes))
            content.append(image)

        response = model.generate_content(content)
        responseText = response.text.strip()

        # Clean JSON markdown quotes if returned
        if responseText.startswith("```json"):
            responseText = responseText[7:]
        if responseText.endswith("```"):
            responseText = responseText[:-3]

        parsed = json.loads(responseText.strip())
        return parsed

    except Exception as e:
        print(f"[AI Service Error] Gemini Vision analysis failed: {e}. Falling back.")
        return fallback
