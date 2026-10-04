# Testing (V0)

Tests observe behavior from the outside — HTTP ("Hypertext Transfer Protocol") requests and PostgreSQL — not internal implementation details.

## Approach

**Integration tests** are the main confidence layer for the API ("Application Programming Interface"): real HTTP against an in-process server, real database when a route needs it. **Unit tests** cover isolated logic without I/O ("Input/Output") — use sparingly. **Visual tests** in `ui-kit` screenshot Storybook components via Playwright.

Runner: Node.js built-in `node:test` and `node:assert/strict`. No separate test framework in V0.

**Out of scope for now:** multi-service E2E ("End-to-End"), live MAVLink ("Micro Air Vehicle Link") UDP, load/chaos, cloud deployment.

Today only `api` defines `test` and `test:integration`. `ui-kit` has Playwright visual tests: `pnpm ui-kit test:visual` (after `test:visual:install` once).

## Commands

```bash
pnpm db:up
pnpm test && pnpm test:integration
```

`pnpm test` needs no database. `pnpm test:integration` needs Compose up and `DATABASE_URL` matching [prerequisites](prerequisites.md#environment-variables). The suite does not start containers for you.

## Database tests

PostgreSQL must be running before integration tests. Tests should fail clearly when the database is unreachable. Schema and cleanup strategy belong in migration/test code — not duplicated here.
