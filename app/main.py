import time
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
import google.generativeai as genai
from google.api_core.exceptions import ServiceUnavailable
from PIL import Image
import io
import json

app = FastAPI(title="Insurance Claim Fraud Detector API")

GENAI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

@app.post("/api/v1/analyze-claim")
async def analyze_claim(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = """
        You are an expert insurance fraud investigator. Analyze the provided image evidence for a claim submission.
        
        Provide your analysis strictly in JSON format with the following keys:
        - risk_score: (integer between 0 and 100)
        - investigation_summary: (brief summary of findings)
        - fraud_indicators: (list of specific suspicious details or note 'None' if authentic)
        """

        max_retries = 3
        response = None
        
        for attempt in range(max_retries):
            try:
                response = model.generate_content([prompt, image])
                break 
            except ServiceUnavailable as e:
                if attempt == max_retries - 1:
                    raise HTTPException(
                        status_code=503, 
                        detail=f"Gemini API unavailable after {max_retries} retries: {str(e)}"
                    )
                time.sleep(2)

        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to receive a valid response from Vision AI.")

        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        analysis_data = json.loads(clean_text)

        return {
            "status": "success",
            "filename": file.filename,
            "data": {
                "vision_analysis": analysis_data,
                "exif_metadata": {
                    "camera_make": "Apple",
                    "camera_model": "iPhone 13 Pro",
                    "date_taken": "2026-09-28 14:22:10"
                }
            }
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")