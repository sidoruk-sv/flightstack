import { createServer } from './app.js';
import { logServerReady } from './logStartup.js';

const server = createServer();
const PORT = Number(process.env['PORT'] ?? 3000);

server.listen(PORT, () => {
  logServerReady({ port: PORT });
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
