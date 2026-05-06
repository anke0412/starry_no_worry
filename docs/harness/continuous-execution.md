# Continuous Execution

This repo is designed for long-running work with minimal human interruption.

## Default Rule

The main agent should keep working across task boundaries until one of these happens:

- a real escalation condition is reached
- a hard blocker prevents safe progress
- the user explicitly asks to pause

## Continuation Policy

When a task finishes:

- update the completed task plan
- select the next coherent task from the current phase queue
- create or activate the next plan in `work/plans/`
- begin execution without waiting for a fresh "start" instruction

## Allowed Assumptions

The main agent should make reasonable local assumptions when:

- the roadmap priority is already clear
- the next task is a direct continuation of the current phase
- implementation detail choices do not change product direction

## Required Pause Conditions

Pause only for:

- roadmap reprioritization
- product direction forks
- destructive actions
- unresolved architecture contradictions
- repeated failed recovery attempts
