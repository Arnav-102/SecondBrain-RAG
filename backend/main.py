import os
import uuid
import PyPDF2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from chromadb.config import Settings
from groq import Groq
import uvicorn

app = FastAPI(title="Second Brain v2 API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB (Persistent local storage)
chroma_client = chromadb.PersistentClient(path="./chroma_db")
# Create or get collection
collection = chroma_client.get_or_create_collection(name="second_brain_docs")

# Initialize Groq client
# Ensure GROQ_API_KEY is set in environment variables
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

class ChatRequest(BaseModel):
    message: str

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Second Brain v2 API is running."}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf') and not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")
    
    # Save file temporarily
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Extract text
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(temp_path)
        else:
            with open(temp_path, "r", encoding="utf-8") as f:
                text = f.read()
        
        # Chunk text
        chunks = chunk_text(text)
        if not chunks:
            return {"status": "error", "message": "No text extracted"}
        
        # Add to ChromaDB
        # ChromaDB automatically embeds using all-MiniLM-L6-v2 when no embedding function is explicitly provided
        ids = [f"{file.filename}_{i}_{uuid.uuid4().hex[:8]}" for i in range(len(chunks))]
        metadatas = [{"source": file.filename, "chunk_index": i} for i in range(len(chunks))]
        
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
        return {"status": "success", "filename": file.filename, "chunks_processed": len(chunks)}
    
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.delete("/documents/{filename}")
def delete_document(filename: str):
    try:
        collection.delete(where={"source": filename})
        return {"status": "success", "message": f"Deleted {filename} from knowledge base"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_with_brain(request: ChatRequest):
    if not groq_client.api_key:
        return {"reply": "Groq API Key not found. Please set GROQ_API_KEY environment variable."}
    
    # Retrieve context from ChromaDB
    results = collection.query(
        query_texts=[request.message],
        n_results=3
    )
    
    context = ""
    if results['documents'] and results['documents'][0]:
        context = "\n".join(results['documents'][0])
    
    # Construct Prompt
    system_prompt = (
        "You are 'Second Brain v2', an AI portfolio assistant for Arnav Sinha. "
        "Use the following context extracted from uploaded documents to answer the user's question. "
        "If the answer is not in the context, say you don't know based on the provided documents.\n\n"
        f"Context:\n{context}"
    )
    
    try:
        completion = groq_client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        reply = completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Error calling Groq API: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
