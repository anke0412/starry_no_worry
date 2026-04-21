# Starry No Worry Backend

FastAPI service boundary for astrology chart calculation.

## Setup

From the repository root:

```bash
python3.12 -m venv .venv312
.venv312/bin/python -m pip install -r backend/requirements-dev.txt
```

Python 3.12 is recommended for the backend environment. Python 3.14 can build some astronomy packages differently on macOS and may fail on native extension compilation.

## Run Tests

```bash
cd backend
../.venv312/bin/python -m pytest tests
```

## Run API Locally

```bash
cd backend
../.venv312/bin/python -m uvicorn app.main:app --reload --port 8000
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

## Ephemeris Foundation

The current ephemeris service uses `ephem` as the calculation adapter. It provides:

- Birth datetime normalization to UTC
- Default planet body list
- Ecliptic longitude calculation
- Zodiac sign, degree, and minute mapping
- Golden test coverage for a known Sun position
