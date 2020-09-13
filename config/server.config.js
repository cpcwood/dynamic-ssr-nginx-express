require('dotenv').config();

const apiHostLocation = process.env.API_HOST_PORT ? 'local' : 'remote';

module.exports = {
  resolveApiHost(req) {
    const port = process.env.API_HOST_PORT ? `:${process.env.API_HOST_PORT}` : '';
    if (process.env.API_HOST_LOCAL) {
      return `localhost${port}${req.originalUrl}`;
    }
    return `${process.env.API_PROTOCOL}://${process.env.API_HOST}${port}${req.originalUrl}`;
  },
  apiHostLocation,
};
