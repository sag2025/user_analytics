const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// constant-time string comparison
const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

exports.login = asyncHandler(async (req, res) => {
  const { name, password } = req.body || {};
  if (typeof name !== 'string' || typeof password !== 'string') throw new AppError(400, 'Name and password are required');

  const okName = safeEqual(name.trim().toLowerCase(), config.adminName.toLowerCase());
  const okPass = safeEqual(password, config.adminPassword);
  if (!okName || !okPass) throw new AppError(401, 'Invalid admin credentials');

  const token = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '8h' });
  res.json({ token });
});
