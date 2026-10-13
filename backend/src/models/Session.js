const crypto = require('crypto');
const mongoose = require('mongoose');
const { config } = require('../config/env');

const sessionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

// TTL index: MongoDB removes the document automatically after expires_at
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Create a session (random unguessable id + expiry) for a user
sessionSchema.statics.createForUser = function (userId) {
  return this.create({
    session_id: crypto.randomBytes(24).toString('hex'),
    user_id: userId,
    expires_at: new Date(Date.now() + config.sessionTtlHours * 3600 * 1000),
  });
};

// Which of these session ids are real and not expired?
sessionSchema.statics.findValid = function (sessionIds) {
  return this.find({ session_id: { $in: sessionIds }, expires_at: { $gt: new Date() } }).lean();
};

module.exports = mongoose.model('Session', sessionSchema);
