# Project Bootstrap

This project is already bootstrapped. This file acts as the one-page summary the main agent should trust first.

## Status

- Bootstrap state: `active`
- Last updated: `2026-04-29`

## Project Identity

- Project name: `Starry No Worry`
- Repo type: React frontend + FastAPI backend monorepo-style app
- Primary surface: astrology chart generation and reading
- Primary users: astrology-curious users and more advanced chart readers
- Core user problem: generate readable, trustworthy astrology chart outputs across multiple chart families
- Current stage: Phase 2 advanced astrologer tools

## Product Snapshot

- One-sentence product summary: a staged astrology platform growing from a reliable tool MVP into a broader professional charting system
- Main user journey: enter profile data, generate a chart, inspect wheel and tables, read structured interpretation
- Key success metric: stable, accurate chart-family expansion on top of the shared generation framework
- Non-goal right now: broad platform features like payments, community, and accounts-first work

## Technical Snapshot

- Frontend stack: React + Vite
- Backend stack: Python 3.12 + FastAPI
- Data/storage: local browser persistence today, no cloud persistence requirement in the current phase
- Deployment target: deployable frontend and backend surfaces
- Existing constraints: chart correctness, Chinese terminology quality, shared chart contract stability, `.venv312` backend baseline

## Team And Workflow

- Human decision-maker: repository owner
- Main agent role: restore context, maintain the active plan, delegate bounded work, integrate and verify
- Expected subagent usage: `impl`, `review`, and `verify` stages for Phase 2 tasks
- Preferred verification baseline: backend pytest + frontend tests + frontend build unless a documented exemption applies
