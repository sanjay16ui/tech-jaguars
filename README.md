# BIS Sentinel

A complete, user-facing BIS/ISI certification verification web application.

## Prerequisites
- Node.js
- Python 3.9+
- Windows PowerShell

## Setup

1. **Clone the repository** (if not already done).

2. **Environment variables**:
   Copy `.env.example` to `.env` in the root folder and set your `GROQ_API_KEY`.
   ```powershell
   Copy-Item .env.example .env
   # Edit .env and add your keys
   ```

3. **Backend Setup**:
   ```powershell
   # Create a virtual environment if you don't have one
   python -m venv .venv
   
   # Install backend dependencies
   .\.venv\Scripts\pip install -r backend\requirements.txt
   ```

4. **Frontend Setup**:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

## Running the Servers

Start the backend:
```powershell
.\.venv\Scripts\uvicorn backend.main:app --reload --port 8000
```

Start the frontend:
```powershell
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.
