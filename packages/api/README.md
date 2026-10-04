# API

V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") — routing, application logic, PostgreSQL access. Part of the monorepo; see root [architecture](../../README.md#architecture).

Configuration from repo-root `.env`. Tests: [docs/testing.md](../../docs/testing.md). Tooling: [docs/prerequisites.md](../../docs/prerequisites.md).

```bash
pnpm api start
pnpm api test
pnpm api test:integration   # needs pnpm db:up
```
