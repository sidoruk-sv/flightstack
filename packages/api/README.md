# API ("Application Programming Interface")

V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") backend for FlightStack. Part of the monorepo — see the root [README.md](../../README.md) for prerequisites, scripts, and verification steps.

## Project structure

| Path            | Responsibility                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/`          | TypeScript source for the V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") |
| `src/app.ts`    | HTTP ("Hypertext Transfer Protocol") server factory                                                         |
| `src/router.ts` | HTTP ("Hypertext Transfer Protocol") routing — path and method matching, error responses                    |
| `src/index.ts`  | Application entry point — starts the server and handles process shutdown                                    |
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

## Conventions vs tooling requirements

Some choices are required by Node.js or TypeScript; others are FlightStack API ("Application Programming Interface") conventions.

| Required by tooling                                | Project convention                                            |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `package.json` and `scripts`                       | Script names `dev`, `build`, `typecheck`, `start`, and `test` |
| `main` and `types` pointing at compiled output     | Source under `src/`, output under `dist/`                     |
| `tsconfig.json` `rootDir`, `outDir`, and `include` | Application entry at `src/index.ts`                           |
| `node dist/index.js` to run compiled code          | `"type": "module"` for ECMAScript modules                     |
