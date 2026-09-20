import http from 'node:http';
import { handleRoutes } from './router.js';

function createServer() {
  return http.createServer(handleRoutes);
}

export { createServer };
