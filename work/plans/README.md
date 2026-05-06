# Plans

Each active task should have one execution-ready plan file here.

The main agent should treat the newest plan marked `active` as the current entrypoint.

Within one active rollout plan, continue from one unfinished step or slide to the next rather than treating local completion as a session boundary.

If no plan is currently `active`, the main agent must create the next execution-ready plan before changing code and should continue without waiting for a fresh user `start` instruction unless escalation is required.
