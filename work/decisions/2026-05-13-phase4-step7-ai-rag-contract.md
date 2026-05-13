# Phase 4 Step 7 AI RAG Contract

## Date

- 2026-05-13

## Decision

Establish the first reusable AI interpretation contract as four explicit layers instead of extending the old single-file interpretation helper.

## Approved Contract

- `context` layer assembles:
  - chart audience
  - normalized chart metadata
  - partial-reading entry points
  - chart tags
  - QA bridge metadata
- `retrieval` layer resolves ranked notes from a local interpretation library
- `report` layer composes:
  - summary
  - sections
  - entry points
  - retrieval notes
  - QA bridge
- frontend result page exposes:
  - `局部解读入口`
  - `检索依据`
  - `以后问答预留`

## Why

- this creates a reusable seam for Step 8 without forcing a full LLM Q&A surface prematurely
- it keeps chart math and interpretation still separated
- it gives later RAG and question-answering work stable contracts instead of relying on one large formatter file
