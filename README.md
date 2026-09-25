# 🛡️ Insurance Claims Photo-Fraud & Staged-Accident Detector

> An automated, hybrid AI claims-auditing engine built with **Python (FastAPI + LangChain)**, **Google Gemini Vision**, and **n8n**.

---

## 📁 Repository Structure

```text
insurance-claim-fraud-detector/
├── docs/
│   ├── PRD.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   ├── AGENT_SPECIFICATION.md
│   └── TASK.md
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   ├── services/
│   │   └── schemas/
│   └── requirements.txt
├── n8n/
│   └── workflows/
│       └── claim_fraud_pipeline.json
├── tests/
│   └── mock_claims/
├── .env.example
├── .gitignore
└── README.md