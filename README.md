# 🛡️ MedSafe AI — AI-Powered Medical Report Analysis Platform

A full-stack medical AI platform that analyzes lab report PDFs through a 
multi-layer AI pipeline: PDF parsing → RAG retrieval → LangChain chains → 
3 AI agents → risk scoring.

## 🔗 Live Demo
- **Frontend:** https://medsafe-ai.vercel.app
- **Backend API:** https://medsafe-ai-backend.onrender.com/docs

> ⚠️ First load may take 30-60 seconds (Render free tier cold start)

## 🏗️ Architecture
PDF Upload
↓
FastAPI Backend
↓
PyMuPDF (text extraction)
↓
LangChain RAG Chain ← ChromaDB (695 FDA drug docs + 35 lab ranges)
↓
3 AI Agents (LangGraph ReAct)
├── Lab Analysis Agent
├── Medicine Safety Agent
└── Risk Orchestrator
↓
Groq response
## ✨ Features
- Upload any lab report PDF and extract 10+ lab parameters automatically
- RAG pipeline grounded in 695 real FDA drug label documents (via OpenFDA API)
- 3 specialized AI agents that reason step-by-step using tools
- Medicine interaction checker cross-referencing drugs against actual lab values
- Risk scoring: LOW / MODERATE / HIGH / CRITICAL per parameter
- Clean dark UI with teal accents

## 🛠️ Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| AI Orchestration | LangChain, LangGraph |
| Vector Database | ChromaDB + SentenceTransformers |
| LLM | Google Gemini 2.5 Flash |
| PDF Parsing | PyMuPDF |
| Drug Data | OpenFDA API |

## 🚀 Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Add GEMINI_API_KEY to .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Rebuild Vector DB (optional)
```bash
cd backend
python -m app.services.build_vector_db
```

## 📁 Project Structure
MedSafe-AI/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/          # upload, medicine endpoints
│   │   ├── services/        # gemini, rag, chain, agent, lab_parser
│   │   └── models/          # pydantic schemas
│   └── chroma_db/           # persisted vector database
└── frontend/
└── src/
├── components/      # Pill, RiskCard, AIBlock, etc.
├── theme.js
└── App.jsx
## ⚠️ Disclaimer
This tool is for educational/portfolio purposes only. Not a substitute 
for professional medical advice.
