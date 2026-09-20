import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { once } from 'node:events';
import type { AddressInfo, Server } from 'node:net';
import { createServer } from './app.js';

describe('app', () => {
  let listeningServer: Server;
  let baseUrl: string;

  beforeEach(async () => {
    listeningServer = createServer().listen(0);
    await once(listeningServer, 'listening');
    const port = (listeningServer.address() as AddressInfo).port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    listeningServer.close();
    await once(listeningServer, 'close');
  });

  test('GET /', async () => {
    const response = await fetch(`${baseUrl}/`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), { message: 'Hello World' });
  });

  test('GET /health', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(
      response.headers.get('content-type'),
      'application/json',
    );
    assert.deepStrictEqual(await response.json(), { status: 'ok' });
  });

  test('GET /unknown', async () => {
    const response = await fetch(`${baseUrl}/unknown`);
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(await response.json(), { message: 'Not Found' });
  });

  test('POST /', async () => {
    const response = await fetch(`${baseUrl}/`, { method: 'POST' });
    assert.strictEqual(response.status, 405);
    assert.deepStrictEqual(await response.json(), {
      message: 'Method Not Allowed',
    });
    assert.strictEqual(response.headers.get('Allow'), 'GET');
  });
});
