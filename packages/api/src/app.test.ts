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
});
