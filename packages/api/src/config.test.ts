import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { afterEach, describe, test } from 'node:test';
import { ConfigError, loadConfig } from './config.js';

const ENV_KEYS = ['DATABASE_URL', 'PORT'] as const;
const TEST_ENV_FILE_PATH = resolve('/nonexistent/flightstack-test.env');

describe('config', () => {
  const savedEnv = new Map<string, string | undefined>();

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = savedEnv.get(key);

      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    savedEnv.clear();
  });

  test('loadConfig requires DATABASE_URL', () => {
    for (const key of ENV_KEYS) {
      savedEnv.set(key, process.env[key]);
    }

    delete process.env['DATABASE_URL'];

    assert.throws(
      () => loadConfig({ envFilePath: TEST_ENV_FILE_PATH }),
      (error: unknown) => {
      assert.ok(error instanceof ConfigError);
      assert.match(error.message, /DATABASE_URL/);
      assert.match(error.message, /\.env\.example/);
      return true;
    });
  });

  test('loadConfig rejects an invalid PORT', () => {
    for (const key of ENV_KEYS) {
      savedEnv.set(key, process.env[key]);
    }

    process.env['DATABASE_URL'] =
      'postgresql://flightstack:flightstack@localhost:5432/flightstack';
    process.env['PORT'] = 'not-a-port';

    assert.throws(
      () => loadConfig({ envFilePath: TEST_ENV_FILE_PATH }),
      (error: unknown) => {
      assert.ok(error instanceof ConfigError);
      assert.match(error.message, /PORT/);
      return true;
    });
  });

  test('loadConfig reads DATABASE_URL and defaults PORT to 3000', () => {
    for (const key of ENV_KEYS) {
      savedEnv.set(key, process.env[key]);
    }

    process.env['DATABASE_URL'] =
      'postgresql://flightstack:flightstack@localhost:5432/flightstack';
    delete process.env['PORT'];

    const config = loadConfig({ envFilePath: TEST_ENV_FILE_PATH });

    assert.strictEqual(
      config.databaseUrl,
      'postgresql://flightstack:flightstack@localhost:5432/flightstack',
    );
    assert.strictEqual(config.port, 3000);
  });
});
