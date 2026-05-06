# Repository Agent Protocol

This repository uses a harness-style workflow.

## Startup Read Order

Read project context in this order before executing work:

1. `AGENTS.md`
2. `docs/harness/project-bootstrap.md`
3. `plan.md`
4. `docs/project-memory-brief-zh.md`
5. `docs/project-memory-zh.md`
6. `docs/product/`
7. `docs/architecture/`
8. `docs/engineering/`
9. `docs/harness/`
10. current active plan in `work/plans/`
11. `work/runs/` and `work/decisions/` only when needed

## Documentation Layers

- `docs/` stores long-term stable truth.
- `work/` stores runtime execution state.
- Do not place temporary task state in `docs/`.
- Do not create parallel roadmap, todo, or plan systems outside the harness.

## Task Entry

- `work/plans/` is the only task entry.
- If an active plan exists, execute it.
- If no execution-ready plan exists, create one before touching product code.

## Agent Roles

- The main agent owns context reading, plan maintenance, task slicing, integration, and completion judgment.
- Sub agents only handle bounded local tasks.
- Only the main agent updates plan status and checkboxes.

## Default Execution Phases

Unless clearly not applicable, formal work proceeds in:

1. `impl`
2. `review`
3. `verify`

## Branch Discipline

- Use a dedicated branch for each bounded step.
- Branch names should follow `codex/<plan-slug>-<step-slug>`.

## Completion Discipline

- Update `work/plans/*.md` when a step advances.
- Update long-term docs only when stable facts change.
- Record temporary decisions in `work/decisions/` when they matter for recovery.
