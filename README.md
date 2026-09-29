# Second Brain v2 (RAG Pipeline) 🧠

A full-stack, cloud-native **Retrieval-Augmented Generation (RAG)** pipeline designed to act as an intelligent knowledge assistant. This system parses documents, generates high-dimensional embeddings using ChromaDB, and performs semantic cosine-similarity search before passing context to a cloud-based LLM (Llama 3 via Groq) for rapid inference.

## 🚀 Architecture & Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Python + FastAPI
- **Vector Database:** ChromaDB (Local / In-Memory)
- **LLM Engine:** Groq API (`llama3-8b-8192`) for near-instant inference

## 🛠️ Features
- **Document Ingestion:** Securely parse and chunk text from local files.
- **Semantic Search:** Embeddings-based retrieval ensuring the LLM only answers based on provided knowledge context.
- **Sub-150ms Latency:** Optimized architecture bridging a lightweight FastAPI microservice with Groq's high-speed Llama 3 endpoint.
- **Modern UI:** Responsive, glassmorphic design built with Tailwind CSS.

## 💻 Running Locally

You will need two terminals to run the frontend and backend simultaneously.

### 1. Start the Python Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
*Note: Make sure to set your `GROQ_API_KEY` in your environment variables.*

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Live Demo
*Coming soon: Deployment links via Vercel (Frontend) and Render (Backend).*
