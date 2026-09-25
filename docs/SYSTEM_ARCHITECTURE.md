# System Architecture Specification

## 1. System Overview
The Insurance Claims Fraud Detector uses a **Hybrid Architecture**. **n8n** acts as the orchestration gateway and notification engine, while a **Python FastAPI (LangChain)** microservice serves as the analytical brain handling binary processing, metadata extraction, and multi-modal AI reasoning.

```text
+-------------------------------------------------------------------+
|                        Client Intake Form                         |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        n8n Webhook Node                           |
+-------------------------------------------------------------------+
                                  |
                      (HTTP POST Claim Payload)
                                  v
+-------------------------------------------------------------------+
|                   Python FastAPI Backend Service                  |
|                                                                   |
|   +-----------------------+           +-----------------------+   |
|   |  Pillow EXIF Parser   |           |  Reverse Image Search |   |
|   +-----------------------+           +-----------------------+   |
|               \                               /                   |
|                v                             v                    |
|   +-----------------------------------------------------------+   |
|   |    LangChain Agent (Google Gemini 2.5/1.5 Flash Vision)   |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
                                  |
                   (Returns Fraud Assessment JSON)
                                  v
+-------------------------------------------------------------------+
|                      n8n IF Decision Router                       |
+-------------------------------------------------------------------+
           /                                             \
  (Fraud Score >= 60)                           (Fraud Score < 60)
         /                                                 \
        v                                                   v
+-----------------------------------+   +---------------------------+
| Slack Alert (#fraud-unit)         |   | Gmail Auto-Payout Notice  |
| Google Sheets Log (Flagged)       |   | Google Sheets Log (Passed)|
+-----------------------------------+   +---------------------------+