import { createServer } from './app.js';
import { ConfigError, loadConfig } from './config.js';
import { logServerReady } from './logStartup.js';

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

const server = createServer();

server.listen(config.port, () => {
  logServerReady({ port: config.port });
});

const shutdown = () => {
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();

  server.close(() => {
    clearTimeout(forceExit);
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
