$ErrorActionPreference = "Stop"

# Force ALL caches and temp folders to the D drive
$env:TEMP = "D:\second-brain-web-cache\temp"
$env:TMP = "D:\second-brain-web-cache\temp"
$env:LOCALAPPDATA = "D:\second-brain-web-cache\localappdata"
$env:APPDATA = "D:\second-brain-web-cache\appdata"
$env:USERPROFILE = "D:\second-brain-web-cache\userprofile"

# Specific tool caches
$env:npm_config_cache = "D:\second-brain-web-cache\npm"

# Create the directories so they exist
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
New-Item -ItemType Directory -Force -Path $env:LOCALAPPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:APPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:USERPROFILE | Out-Null
New-Item -ItemType Directory -Force -Path $env:npm_config_cache | Out-Null

cd D:\second-brain-web\frontend

Write-Host "Installing frontend dependencies... (strictly inside D drive)"
npm install

Write-Host "Starting frontend..."
npm run dev
