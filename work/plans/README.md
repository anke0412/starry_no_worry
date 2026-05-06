# Plans

Each active task should have one execution-ready plan file here.

The main agent should treat the newest plan marked `active` as the current entrypoint.

Current completed plans may remain in place for audit and recovery.

If no plan is currently `active`, the main agent must create the next execution-ready plan before changing code and should continue without waiting for a fresh user "start" instruction unless escalation is required.

Within one active rollout plan, the main agent should continue from one unfinished step or slide to the next rather than treating each local completion as a session boundary.
