import shutil
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.vision_agent import analyze_claim_image

app = FastAPI(
    title="Insurance Claim Photo-Fraud Detector API",
    description="Backend API to analyze claim photos for EXIF metadata and visual AI fraud indicators.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to temporarily store uploaded claim images
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def read_root():
    return {"status": "online", "message": "Insurance Claim Fraud Detector API is running"}


@app.post("/api/v1/analyze-claim")
async def analyze_claim(file: UploadFile = File(...)):
    """
    Receives an uploaded claim image, runs EXIF metadata extraction 
    and Gemini Vision AI fraud assessment, and returns a structured JSON report.
    """
    # Validate uploaded file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image file.")

    temp_file_path = UPLOAD_DIR / file.filename

    try:
        # Save uploaded bytes to local temporary disk
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run vision analysis engine
        report = analyze_claim_image(str(temp_file_path))

        return {
            "filename": file.filename,
            "status": "success",
            "data": report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claim processing failed: {str(e)}")

    finally:
        # Clean up local temporary file
        if temp_file_path.exists():
            temp_file_path.unlink()