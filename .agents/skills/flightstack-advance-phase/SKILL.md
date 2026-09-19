---
name: flightstack-advance-phase
description: Updates FlightStack version progress in README when a phase milestone ships (e.g. V0 to V1). Use when advancing to a new version, completing a version milestone, or when asked to update the current phase.
---

# Advance FlightStack phase

Canonical progress lives in [README.md](../../../README.md) — `## Current phase: VX`.

When a version milestone ships, update README only:

1. Rename `## Current phase: VX` (heading and anchor).
2. Update the [Current phase](#current-phase-vx) link under Evolution path to match the new anchor.
3. Rewrite the phase section body — scope, diagrams, API contract — using the evolution table as the reference for what the new version adds.
