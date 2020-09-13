require('dotenv').config();

const debug = require('debug')('express:server');
const express = require('express');
const config = require('./config/server.config');
const renderer = require('./components/renderer');

const port = process.env.PORT || 5001;
const address = process.env.ADDRESS || '0.0.0.0';
const environment = process.env.NODE_ENV || 'development';

const app = express();

app.get('/', async (req, res) => {
  const requestPath = config.resolveApiHost(req);
  const html = await renderer(requestPath);
  return res.status(200).send(html);
});

const server = app.listen(port, address, () => {
  debug(`Starting dynamic SSR server in ${environment} mode`);
  debug(`Server is listening on port ${port}`);
  debug(`Server is listening on address ${address}`);
  debug(`Rendering pages for ${config.apiHostLocation} API server`);
});

server.on('connection', (socket) => {
  // 2 min timeout
  socket.setTimeout(2 * 60 * 1000);
});

// graceful shutdown
process.on('SIGTERM', () => {
  debug('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    debug('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  debug('SIGINT signal received: closing HTTP server');
  server.close(() => {
    debug('HTTP server closed');
  });
});
