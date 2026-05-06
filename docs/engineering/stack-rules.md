# Stack Rules

## Primary Stack

- frontend: React 19 + Vite
- frontend tests: Node built-in test runner
- backend: Python 3.12 + FastAPI
- backend tests: pytest

## Environment Rules

- backend verification baseline uses `.venv312`
- Python 3.12 is preferred for backend dependency stability
- local backend runs through uvicorn from the `backend` directory

## Dependency Rules

- prefer extending current libraries before adding new ones
- any dependency with calculation or native build impact requires explicit review
