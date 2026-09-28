import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image
from google import genai
from google.genai import types
from app.exif_parser import extract_exif_metadata

# Explicitly point to .env file in project root (one level up from app/)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def analyze_claim_image(image_path: str) -> dict:
    """
    Extracts EXIF metadata and analyzes claim images using Gemini Vision AI.
    """
    # 1. Extract EXIF Metadata
    exif_data = extract_exif_metadata(image_path)

    # Fetch API Key from environment variables
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": f"GEMINI_API_KEY missing. Checked path: {env_path}"}

    # 2. Initialize Gemini Client with API Key and Timeout (in seconds)
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=120.0  # 120 seconds timeout
        )
    )

    # 3. Prompt Definition
    prompt = """
    You are an expert insurance fraud investigator and visual claim auditor.
    Analyze the provided image for evidence in an insurance claim.
    
    Provide a structured report in valid JSON format with the following keys:
    - "visual_description": A detailed summary of what is visible in the photo.
    - "detected_damage": List any physical damage observed (or "None" if clear).
    - "fraud_indicators": List any signs of photo tampering, staged scenes, digital manipulation, or inconsistencies.
    - "risk_score": An integer from 0 to 100 representing overall fraud risk (0 = genuine, 100 = high fraud risk).
    - "investigation_summary": A concise recommendation for the claim auditor.

    Return ONLY raw JSON output without markdown formatting or code blocks.
    """

    try:
        # Load image with PIL to send directly in memory (bypasses upload write timeouts)
        img = Image.open(image_path)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[img, prompt]
        )

        ai_analysis = response.text.strip()

        # Clean markdown code block formatting if returned
        cleaned_json = re.sub(r"^```json\s*|\s*```$", "", ai_analysis, flags=re.MULTILINE).strip()

        # Parse AI JSON output
        try:
            parsed_ai_analysis = json.loads(cleaned_json)
        except json.JSONDecodeError:
            parsed_ai_analysis = {"raw_text": ai_analysis}

        return {
            "exif_metadata": exif_data,
            "vision_analysis": parsed_ai_analysis
        }

    except Exception as e:
        return {"error": f"Vision analysis failed: {str(e)}"}


if __name__ == "__main__":
    import pprint
    test_file = "test.jpg"
    print(f"--- Running Vision Analysis on {test_file} ---")
    output = analyze_claim_image(test_file)
    pprint.pprint(output)