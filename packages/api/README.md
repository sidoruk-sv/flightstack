# API ("Application Programming Interface")

V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") backend for FlightStack. Part of the monorepo — see the root [README.md](../../README.md) for prerequisites, scripts, and verification steps.

## Project structure

| Path            | Responsibility                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/`          | TypeScript source for the V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") |
| `src/app.ts`    | HTTP ("Hypertext Transfer Protocol") server factory                                                         |
| `src/router.ts` | HTTP ("Hypertext Transfer Protocol") routing — path and method matching, error responses                    |
| `src/config.ts` | Runtime configuration — reads environment variables and validates required settings                           |
| `src/index.ts`  | Application entry point — loads configuration, starts the server, and handles process shutdown               |
| `dist/`         | Compiled JavaScript output (generated, not committed)                                                       |
| `package.json`  | Package metadata, entry (`main`), and scripts                                                               |
| `tsconfig.json` | TypeScript compiler options                                                                                 |

Build output under `dist/` is excluded from version control via the root `.gitignore`.

## Routing

`src/router.ts` holds the route table and dispatches each request by path and HTTP ("Hypertext Transfer Protocol") method. `src/app.ts` passes incoming requests to `handleRoutes`.

Unknown paths return `404` with a JSON ("JavaScript Object Notation") body: `{ "message": "Not Found" }`. Unsupported methods on a known path return `405` with `{ "message": "Method Not Allowed" }` and an `Allow` header listing the methods registered for that path.

## Endpoints

| Method | Path      | Response body           | Purpose                                      |
| ------ | --------- | ----------------------- | -------------------------------------------- |
| `GET`  | `/health` | `{ "status": "ok" }`    | Confirm the backend process is responding    |

`GET /health` reports process health only — it does not check PostgreSQL or other dependencies.

## Configuration

Settings are read from environment variables when the process starts. For local development, copy `.env.example` to `.env` at the repository root; `src/config.ts` loads that file when present.

| Variable       | Required | Default | Purpose                                      |
| -------------- | -------- | ------- | -------------------------------------------- |
| `DATABASE_URL` | yes      | —       | PostgreSQL connection string                 |
| `PORT`         | no       | `3000`  | HTTP ("Hypertext Transfer Protocol") listen port |

Missing required configuration throws `ConfigError` with a message that points to `.env.example`. The database connection module that uses `DATABASE_URL` ships in a later issue.

## Testing

Automated tests use the Node.js built-in test runner (`node:test`). Default tests live as `src/**/*.test.ts` (no external services). PostgreSQL integration tests live under `src/integration/**/*.integration.test.ts`.

| Command | Purpose |
| ------- | ------- |
| `pnpm test` (from repo root) | Default tests in all workspace packages — no PostgreSQL |
| `pnpm test:integration` | Integration tests in all workspace packages — run `pnpm db:up` first |
| `pnpm api test` | Default tests in this package only |

Full local check: `pnpm db:up && pnpm test && pnpm test:integration`.

See [docs/testing.md](../../docs/testing.md) for test levels (unit, integration, end-to-end), database setup and cleanup, and what V0 intentionally omits.

## Conventions vs tooling requirements

Some choices are required by Node.js or TypeScript; others are FlightStack API ("Application Programming Interface") conventions.

| Required by tooling                                | Project convention                                            |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `package.json` and `scripts`                       | Script names `dev`, `build`, `typecheck`, `start`, and `test` |
| `main` and `types` pointing at compiled output     | Source under `src/`, output under `dist/`                     |
| `tsconfig.json` `rootDir`, `outDir`, and `include` | Application entry at `src/index.ts`                           |
| `node dist/index.js` to run compiled code          | `"type": "module"` for ECMAScript modules                     |
