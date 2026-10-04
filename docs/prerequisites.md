# Prerequisites

Local tooling for FlightStack. Active version: **V0** ([README](../README.md)).

## Core

| Tool | Notes |
| ---- | ----- |
| Git | hooks via Husky after `pnpm install` |
| Node.js | 24+ (`.nvmrc`) |
| pnpm | 12+ — `pnpm install`, not `npm` |
| `.env` | copy `.env.example` to the repo root |

## Database

Podman (preferred) or Docker with Compose. macOS + Podman: `podman machine start` first.

PostgreSQL on `5432`, Adminer on `8080`. User, password, database: `flightstack`. Scripts: `pnpm db:up`, `pnpm db:down`, `pnpm db:reset`. `docker compose` works like `podman compose`.

Integration tests expect PostgreSQL to already be running — see [testing.md](testing.md).

## SITL ("Software In The Loop") — optional

For `pnpm mavlink start` and multi-vehicle local simulation. Requires Podman (not Docker — the launcher is Podman-specific), an ArduPilot checkout, and a local `localhost/ardupilot-dev:latest` image (one-time setup in [sitl.md](sitl.md#container-image-one-time)). Start the fleet with `./scripts/start-sitl.sh`, then `pnpm mavlink start` on UDP port `14552`. Full setup, architecture, and fleet details: [sitl.md](sitl.md).

## Frontend tooling — optional

Vite, Storybook, and Playwright ship with the repo via `pnpm install`. Playwright browsers: `pnpm ui-kit test:visual:install` once before visual tests.

## Environment variables

Copy `.env.example` to `.env` at the repo root. Both `api` and `mavlink-client` load it when present.

| Variable | Package | Required to start | Default |
| -------- | ------- | ----------------- | ------- |
| `DATABASE_URL` | `api` | yes | — |
| `PORT` | `api` | no | `3000` |
| `MAVLINK_PORT` | `mavlink-client` | no | `14552` |
| `MAVLINK_HOST` | `mavlink-client` | no | `0.0.0.0` |

## Quick start

```bash
pnpm install
cp .env.example .env
podman machine start          # macOS + Podman only
pnpm db:up
pnpm test && pnpm test:integration
```
