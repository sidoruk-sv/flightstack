import { createServer } from './app.js';

const server = createServer();
const PORT = process.env['PORT'] || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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
