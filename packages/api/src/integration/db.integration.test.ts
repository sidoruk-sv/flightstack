// Prerequisites: PostgreSQL running — pnpm db:up (see docs/testing.md).
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { afterEach, describe, test } from 'node:test';
import { loadConfig } from '../config.js';
import { closeDb, createDb, pingDb } from '../db.js';

const TEST_ENV_FILE_PATH = resolve('/nonexistent/flightstack-test.env');

function rethrowIfPostgresUnavailable(error: unknown): never {
  const code =
    error instanceof AggregateError
      ? error.errors.find(
          (cause): cause is NodeJS.ErrnoException =>
            cause instanceof Error && 'code' in cause,
        )?.code
      : error instanceof Error && 'code' in error
        ? (error as NodeJS.ErrnoException).code
        : undefined;

  if (code === 'ECONNREFUSED') {
    throw new Error(
      'PostgreSQL is not reachable. Start it with: pnpm db:up',
      { cause: error },
    );
  }

  throw error;
}

describe('database', () => {
  const savedDatabaseUrl = process.env['DATABASE_URL'];

  afterEach(async () => {
    await closeDb();

    if (savedDatabaseUrl === undefined) {
      delete process.env['DATABASE_URL'];
    } else {
      process.env['DATABASE_URL'] = savedDatabaseUrl;
    }
  });

  test('pingDb connects to PostgreSQL', async () => {
    process.env['DATABASE_URL'] =
      'postgresql://flightstack:flightstack@localhost:5432/flightstack';

    const config = loadConfig({ envFilePath: TEST_ENV_FILE_PATH });

    createDb(config);

    try {
      const result = await pingDb();

      assert.deepStrictEqual(result.rows, [{ one: 1 }]);
    } catch (error) {
      rethrowIfPostgresUnavailable(error);
    }
  });
});
