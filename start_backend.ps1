$ErrorActionPreference = "Stop"

# Force ALL caches and temp folders to the D drive
$env:TEMP = "D:\second-brain-web-cache\temp"
$env:TMP = "D:\second-brain-web-cache\temp"
$env:LOCALAPPDATA = "D:\second-brain-web-cache\localappdata"
$env:APPDATA = "D:\second-brain-web-cache\appdata"
$env:USERPROFILE = "D:\second-brain-web-cache\userprofile"

# Specific tool caches
$env:PIP_CACHE_DIR = "D:\second-brain-web-cache\pip"
$env:HF_HOME = "D:\second-brain-web-cache\huggingface"
$env:CHROMA_CACHE_DIR = "D:\second-brain-web-cache\chroma"

# Create the directories so they exist
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
New-Item -ItemType Directory -Force -Path $env:LOCALAPPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:APPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:USERPROFILE | Out-Null
New-Item -ItemType Directory -Force -Path $env:PIP_CACHE_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $env:HF_HOME | Out-Null
New-Item -ItemType Directory -Force -Path $env:CHROMA_CACHE_DIR | Out-Null

cd D:\second-brain-web\backend

if (-not (Test-Path "venv")) {
    Write-Host "Creating isolated virtual environment..."
    python -m venv venv
}

.\venv\Scripts\Activate.ps1

Write-Host "Installing dependencies... (strictly inside D drive)"
pip install -r requirements.txt

# --- IMPORTANT: SET YOUR GROQ API KEY HERE ---
$env:GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"

Write-Host "Starting backend..."
uvicorn main:app --reload
