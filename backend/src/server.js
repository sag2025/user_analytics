const mongoose = require('mongoose');
const { config, assertEnv } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  assertEnv();
  await connectDB();
  const server = app.listen(config.port, () => console.log(`API listening on port ${config.port}`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
