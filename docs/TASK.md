# Project Task Tracker

## Phase 0: Project Scaffolding & Docs
- [x] Create GitHub Repository structure
- [x] Write PRD, System Architecture, API Specs, and Agent Specs
- [x] Configure `.env.example` and `.gitignore`

## Phase 1: Python Backend Development
- [ ] Initialize Python virtual environment
- [ ] Create `backend/app/main.py` FastAPI server
- [ ] Develop `backend/app/services/exif_parser.py` using Pillow
- [ ] Develop `backend/app/services/search_tool.py` for web search checks
- [ ] Build LangChain Gemini Vision chain with Pydantic output schema
- [ ] Validate local API via Swagger UI (`http://localhost:8000/docs`)

## Phase 2: n8n Workflow Build
- [ ] Create Webhook intake node
- [ ] Create HTTP Request node connecting to FastAPI backend
- [ ] Add IF Node router based on `fraud_score` / `risk_level`
- [ ] Configure Slack Node for High-Risk evidence dispatch
- [ ] Configure Gmail Node for Low-Risk payout notice
- [ ] Configure Google Sheets Node for audit log storage

## Phase 3: Integration & Testing
- [ ] Execute Ngrok tunnel for webhook accessibility
- [ ] Test with valid low-risk sample payload
- [ ] Test with metadata date conflict payload
- [ ] Test with narrative vs damage mismatch sample
- [ ] Final documentation update and submission commit