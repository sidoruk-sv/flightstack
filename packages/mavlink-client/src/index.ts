import dgram from 'node:dgram';
import { ConfigError, loadConfig } from './config.js';
import { logMavlinkReady } from './logStartup.js';
import { attachTelemetryLogger, createMavlinkPipeline } from './pipeline.js';

let config;

try {
  config = loadConfig();
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}

const server = dgram.createSocket('udp4');
const { splitter, parser } = createMavlinkPipeline();

attachTelemetryLogger(parser);

server.on('error', (err) => {
  console.error(`UDP error: ${err.message}`);
  server.close();
});

server.on('message', (msg) => {
  splitter.write(msg);
});

server.on('listening', () => {
  logMavlinkReady({ host: config.host, port: config.port });
});

server.bind({ port: config.port, address: config.host });

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
