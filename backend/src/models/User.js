const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const Session = require('./Session');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
    password_hash: { type: String, required: true }, // bcrypt hash, never the plain password
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

// Used so a wrong username takes as long as a wrong password (no user enumeration by timing)
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// ---- INSERT ----
userSchema.statics.insertUser = async function ({ username, password_hash }) {
  try {
    return await this.create({ username, password_hash });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'Username already taken');
    throw err;
  }
};

userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: String(username).trim().toLowerCase() });
};

userSchema.statics.listAll = function () {
  return this.find({}, 'username created_at').sort({ username: 1 }).limit(500).lean();
};

// ---- REGISTER: build the user object and call the insert method ----
userSchema.statics.register = async function ({ username, password }) {
  const password_hash = await bcrypt.hash(password, 10);
  const user = await this.insertUser({ username, password_hash });
  return { user_id: user._id, username: user.username };
};

// ---- LOGIN: check user, create session with expiry, insert it, return ids ----
userSchema.statics.login = async function ({ username, password }) {
  const user = await this.findByUsername(username);
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'Invalid username or password');

  const session = await Session.createForUser(user._id);
  return {
    user_id: user._id,
    username: user.username,
    session_id: session.session_id,
    expires_at: session.expires_at,
  };
};

module.exports = mongoose.model('User', userSchema);
