const rateLimit = require('express-rate-limit');

const base = { standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, slow down.' } };

// brute-force protection on login/register
exports.authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 30 });
// event ingestion is chatty (every click), so allow more
exports.eventLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 300 });
