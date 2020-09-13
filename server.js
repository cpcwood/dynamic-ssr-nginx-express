require('dotenv').config();

const debug = require('debug')('express:server');
const express = require('express');
const puppeteer = require('puppeteer');
const config = require('./config/server.config');
const renderer = require('./components/renderer');

const port = process.env.PORT || 5001;
const address = process.env.ADDRESS || '0.0.0.0';
const environment = process.env.NODE_ENV || 'development';

let browserWSEndpoint = null;
const app = express();

// ignore requests for static assets
app.use(/\/.*\.\w+$/, (req, res) => res.status(404).send());

app.get('*', async (req, res) => {
  if (!browserWSEndpoint) {
    const browser = await puppeteer.launch();
    browserWSEndpoint = await browser.wsEndpoint();
  }

  const requestPath = config.resolveApiHost(req);
  const html = await renderer(requestPath, browserWSEndpoint);
  return res.status(200).send(html);
});

const server = app.listen(port, address, () => {
  debug(`Starting dynamic SSR server in ${environment} mode`);
  debug(`Server is listening on port ${port}`);
  debug(`Server is listening on address ${address}`);
  debug(`Rendering pages for the ${config.apiHost} server`);
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
