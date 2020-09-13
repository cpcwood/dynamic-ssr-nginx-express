require('dotenv').config();

const port = (process.env.APPLICATION_SERVER_PORT ? `:${process.env.APPLICATION_SERVER_PORT}` : '');
const apiHost = `${process.env.APPLICATION_SERVER_PROTOCOL}://${process.env.APPLICATION_SERVER_HOST}${port}`;

module.exports = {
  resolveApiHost(req) {
    const requestUrl = (req.originalUrl === '/' ? '' : req.originalUrl);
    return apiHost + requestUrl;
  },
  apiHost,
};
