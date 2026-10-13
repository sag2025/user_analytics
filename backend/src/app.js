const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy (needed for correct client IPs / rate limiting)

// cross-origin resource policy relaxed so tracker.js can be loaded from other sites
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, !origin || config.clientOrigins.includes(origin)) }));
// text/plain is accepted because navigator.sendBeacon sends it without a CORS preflight
app.use(express.json({ limit: '100kb', type: ['application/json', 'text/plain'] }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/tracker', express.static(path.join(__dirname, '..', 'tracker'), { maxAge: '1h' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
