# Phase 4 Step 3 Removal

## Date

- 2026-05-08

## Decision

Remove `中点组合盘` and `关系流年盘` end-to-end from the active product surface rather than leaving compatibility shims.

## Why

- both chart families are explicitly out of approved Phase 4 scope
- leaving dormant endpoint or catalog compatibility would keep the wrong chart taxonomy alive
- the current repository is still early enough that removing these contracts is safer than preserving aliases that later AI and derivative work would have to special-case

## Applied Scope

- removed frontend catalog entries
- removed frontend request payload builders and API endpoint routing
- removed frontend result mapping paths and category-specific UI behavior
- removed backend request models
- removed backend routes
- removed backend services
- removed backend tests dedicated to the deleted chart families
- removed contract documentation for the deleted endpoints
- updated stable project memory so the repository no longer claims those chart families are currently source-complete
