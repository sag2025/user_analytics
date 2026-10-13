const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const AppError = require('../utils/AppError');

module.exports = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== 'admin') throw new Error('not admin');
    next();
  } catch {
    next(new AppError(401, 'Admin authentication required'));
  }
};
