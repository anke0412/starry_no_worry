# Continuous Execution

This repo is designed for long-running work with minimal human interruption.

## Default Rule

Keep working across step and plan boundaries until:

- a real escalation condition is reached
- a hard blocker prevents safe progress
- the user explicitly asks to pause

## Continuation Policy

When a step finishes:

- update the active plan
- close the git lifecycle
- move to the next unfinished step

When a plan finishes:

- mark it completed
- activate the next coherent plan
- continue
