# System Overview

The project has two major surfaces:

- React + Vite frontend for profile input, chart rendering, tables, and reports
- FastAPI backend for validation, chart calculation, and structured chart responses

## Boundary Principle

- calculation authority stays in the backend
- the frontend consumes structured chart results
- interpretation remains downstream of calculation contracts
