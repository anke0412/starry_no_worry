# Starry No Worry Backend

FastAPI service boundary for astrology chart calculation.

## Setup

From the repository root:

```bash
python3.12 -m venv .venv312
.venv312/bin/python -m pip install -r backend/requirements-dev.txt
```

Python 3.12 is recommended for the backend environment. Python 3.14 can build some astronomy packages differently on macOS and may fail on native extension compilation.

On some macOS setups, `pyswisseph` may need the Command Line Tools C++ headers to be pointed at an installed SDK during installation:

```bash
CXXFLAGS=-I/Library/Developer/CommandLineTools/SDKs/MacOSX15.sdk/usr/include/c++/v1 \
  .venv312/bin/python -m pip install -r backend/requirements-dev.txt
```

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

The backend currently provides:

- FastAPI application factory
- CORS configuration
- `GET /api/health`
- Structured JSON errors
- Backend dependency files
- Backend tests
- Natal, synastry, and transit chart endpoints
- Natal Placidus houses, Ascendant, Midheaven, and planet house placement

## Ephemeris Foundation

The current ephemeris layer uses `ephem` for planet positions and `pyswisseph` for natal house and angle calculation. It provides:

- Birth datetime normalization to UTC
- Default planet body list
- Ecliptic longitude calculation
- Zodiac sign, degree, and minute mapping
- Placidus house cusps
- Mean lunar nodes
- Ascendant and Midheaven
- Planet house assignment
- Golden test coverage for a known Sun position
