import http from 'node:http';

function createServer() {
  return http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello World' }));
  });
}

export { createServer };
