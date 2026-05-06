# Coding Rules

## General Rules

- preserve existing roadmap and architecture direction while implementing local changes
- prefer small, coherent modules over one-off orchestration sprawl
- keep professional domain terminology accurate in both code-facing labels and user-facing text

## Backend Rules

- reuse shared chart generation services for new chart types
- avoid copy-pasting orchestration logic across chart families
- keep API models and generator outputs aligned

## Frontend Rules

- keep UI behavior contract-driven
- avoid ad hoc label drift across chart views, tooltips, and tables
- fit new chart families into existing reading patterns when possible
