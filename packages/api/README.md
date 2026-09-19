# API ("Application Programming Interface")

V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") backend for FlightStack. Part of the monorepo — see the root [README.md](../../README.md) for prerequisites, scripts, and verification steps.

## Project structure

| Path            | Responsibility                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/`          | TypeScript source for the V0 HTTP ("Hypertext Transfer Protocol") API ("Application Programming Interface") |
| `src/index.ts`  | Application entry point                                                                                     |
| `dist/`         | Compiled JavaScript output (generated, not committed)                                                       |
| `package.json`  | Package metadata, entry (`main`), and scripts                                                               |
| `tsconfig.json` | TypeScript compiler options                                                                                 |

Build output under `dist/` is excluded from version control via the root `.gitignore`.

## Conventions vs tooling requirements

Some choices are required by Node.js or TypeScript; others are FlightStack API ("Application Programming Interface") conventions.

| Required by tooling                                | Project convention                                            |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `package.json` and `scripts`                       | Script names `dev`, `build`, `typecheck`, `start`, and `test` |
| `main` and `types` pointing at compiled output     | Source under `src/`, output under `dist/`                     |
| `tsconfig.json` `rootDir`, `outDir`, and `include` | Application entry at `src/index.ts`                           |
| `node dist/index.js` to run compiled code          | `"type": "module"` for ECMAScript modules                     |
