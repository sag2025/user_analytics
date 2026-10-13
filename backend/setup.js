// Database setup: connects to Atlas, creates the 3 collections and their indexes.
// Safe to re-run any time:  npm run setup
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Session = require('./src/models/Session');
const Event = require('./src/models/Event');

async function setup() {
  await connectDB();
  for (const Model of [User, Session, Event]) {
    await Model.createCollection();
    await Model.syncIndexes();
    const names = (await Model.collection.indexes()).map((i) => i.name).join(', ');
    console.log(`✔ ${Model.collection.name}: ${names}`);
  }
  console.log('Database ready.');
}

setup()
  .catch((err) => { console.error('Setup failed:', err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
