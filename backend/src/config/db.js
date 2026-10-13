const mongoose = require('mongoose');
const { config } = require('./env');

async function connectDB() {
  if (!config.mongoUri) throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = connectDB;
