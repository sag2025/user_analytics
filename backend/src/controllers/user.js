const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

exports.register = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const name = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!USERNAME_RE.test(name)) throw new AppError(400, 'Username must be 3-30 characters: letters, numbers, underscore');
  if (typeof password !== 'string' || password.length < 6 || password.length > 72)
    throw new AppError(400, 'Password must be 6-72 characters');

  const user = await User.register({ username: name, password });
  res.status(201).json(user);
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
    throw new AppError(400, 'Username and password are required');

  res.json(await User.login({ username, password }));
});

exports.listUsers = asyncHandler(async (_req, res) => {
  res.json(await User.listAll());
});
