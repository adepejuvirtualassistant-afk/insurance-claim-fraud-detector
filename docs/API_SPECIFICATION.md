# API Specification

## 1. Endpoint Overview
The Python FastAPI service exposes a single endpoint for claim risk analysis.

* **URL:** `http://localhost:8000/api/v1/analyze-claim`
* **Method:** `POST`
* **Content-Type:** `application/json`

---

## 2. Request Body Schema

```json
{
  "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
  "type": "object",
  "properties": {
    "claimId": { "type": "string", "example": "CLM-2026-9081" },
    "policyNumber": { "type": "string", "example": "POL-883291" },
    "claimantName": { "type": "string", "example": "John Doe" },
    "incidentDate": { "type": "string", "format": "date", "example": "2026-09-20" },
    "incidentLocation": { "type": "string", "example": "Lagos, Nigeria" },
    "narrative": { "type": "string", "example": "Vehicle was parked when hit from behind." },
    "photoUrl": { "type": "string", "format": "uri", "example": "[https://example.com/photo.jpg](https://example.com/photo.jpg)" }
  },
  "required": ["claimId", "policyNumber", "incidentDate", "narrative", "photoUrl"]
}