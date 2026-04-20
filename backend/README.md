# Starry No Worry Backend

FastAPI service boundary for astrology chart calculation.

## Setup

From the repository root:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements-dev.txt
```

## Run Tests

```bash
cd backend
../.venv/bin/python -m pytest tests
```

## Run API Locally

```bash
cd backend
../.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/api/health
```

## Current Scope

This branch establishes the service shell only:

- FastAPI application factory
- CORS configuration
- `GET /api/health`
- Structured JSON errors
- Backend dependency files
- Backend tests

Chart calculation endpoints will be added in later `dev_[detailed_functionname]` branches.
