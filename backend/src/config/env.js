require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminName: process.env.ADMIN_NAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS) || 24,
};

function assertEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_NAME', 'ADMIN_PASSWORD'].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

module.exports = { config, assertEnv };
