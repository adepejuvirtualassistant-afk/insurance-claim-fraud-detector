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

## Phase 2: Frontend Web Testing Interface
- [ ] Create `frontend/index.html` claim submission web form
- [ ] Build `frontend/styles.css` for dashboard styling
- [ ] Write `frontend/app.js` to post claim JSON & photo URLs to local/n8n API
- [ ] Launch local web server (Live Server) for interactive visual testing

## Phase 3: n8n Workflow Build
- [ ] Create Webhook intake node (listening for frontend form submits)
- [ ] Create HTTP Request node connecting to FastAPI backend
- [ ] Add IF Node router based on `fraud_score` / `risk_level`
- [ ] Configure Slack Node for High-Risk evidence dispatch
- [ ] Configure Gmail Node for Low-Risk payout notice
- [ ] Configure Google Sheets Node for audit log storage

## Phase 4: Integration & End-to-End Testing
- [ ] Execute Ngrok tunnel for webhook accessibility
- [ ] Test form submission with valid low-risk sample payload
- [ ] Test form submission with metadata date conflict payload
- [ ] Test form submission with narrative vs damage mismatch sample
- [ ] Final documentation update and submission commit