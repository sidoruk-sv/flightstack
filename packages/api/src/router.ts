import type { IncomingMessage, ServerResponse } from 'node:http';

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => void | Promise<void>;

type RouteTable = Record<string, Partial<Record<string, RouteHandler>>>;

const routes: RouteTable = {
  '/': {
    GET: (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Hello World' }));
    },
  },
  '/health': {
    GET: (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    },
  },
};

export function handleRoutes(req: IncomingMessage, res: ServerResponse) {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  const method = req.method ?? 'GET';
  const handlers = routes[pathname];

  if (!handlers) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
    return;
  }

  const handler = handlers[method];

  if (!handler) {
    res.writeHead(405, {
      'Content-Type': 'application/json',
      Allow: Object.keys(handlers).join(', '),
    });
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    return;
  }

  void handler(req, res);
}
