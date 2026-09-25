# Product Requirements Document (PRD)

## Project Name: Insurance Claims Photo-Fraud & Staged-Accident Detector
> **Version:** 1.0.0  
> **Author:** Adepeju Badmus  
> **Architecture:** Hybrid System (Python FastAPI + LangChain + n8n + Gemini Vision)  

---

## 1. Executive Summary & Problem Statement
Insurance providers lose billions of dollars annually due to fraudulent claims involving altered accident photographs, reused stock images, or staged damage that directly contradicts submitted claim narratives. Manually auditing every claim photograph is computationally expensive and slow.

This project delivers an automated claims-screening engine that ingests claim submissions via webhooks, performs parallel EXIF metadata audits, multi-modal Vision AI evaluations, and web checks, and computes a risk score to guide automated payout approvals or human investigator interventions.

---

## 2. Core Objectives
* **Automate Verification:** Eliminate manual review overhead for verifiable, low-risk claims.
* **Detect Photo Manipulation:** Extract and verify raw image EXIF metadata for creation timestamp, location, and editing software signatures.
* **Evaluate Narrative Alignment:** Utilize multi-modal vision reasoning to verify if visible physical impact patterns match the submitted narrative.
* **Identify Reused Assets:** Verify whether submitted image assets exist elsewhere on public web domain registries.
* **Structured Escalation:** Route suspicious claims to a human investigation channel via Slack with a compiled evidence packet.

---

## 3. User & System Personas
* **Claimant:** Submits incident narrative, policy details, and vehicle accident photo via web/mobile intake form.
* **System Operations (n8n & FastAPI):** Ingests payload, executes analysis, updates database, and triggers communication channels.
* **Fraud Unit Investigator:** Receives enriched Slack alerts for high-risk claims containing structured reasoning and evidence highlights.

---

## 4. Functional Requirements

| Ref ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Webhook Ingestion | Ingest claim details, claimant metadata, and image URL payload | High |
| **FR-02** | EXIF Inspection | Inspect binary headers for creation dates, GPS tags, and editing software | High |
| **FR-03** | Multi-Modal Vision AI | Compare damage location and severity against written incident narrative | High |
| **FR-04** | Web Image Search | Check for pre-existing instances of the photo online | Medium |
| **FR-05** | Fraud Score Engine | Aggregate anomaly points into a normalized 0–100 risk score | High |
| **FR-06** | Conditional Routing | Auto-approve claims score < 60; route claims score ≥ 60 for manual review | High |

---

## 5. Non-Functional Requirements
* **Zero-Cost Operation:** Built entirely using free-tier developer APIs (Google AI Studio, SerpAPI) and open-source packages.
* **Latency:** End-to-end processing execution time under 10 seconds per claim.
* **Deterministic Outputs:** AI analysis must enforce strict Pydantic JSON schemas.