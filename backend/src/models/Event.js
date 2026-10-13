const mongoose = require('mongoose');

const TYPES = ['page_view', 'click', 'page_leave'];
const MAX_LEAVE_MS = 60 * 60 * 1000; // clamp page time to 1h (background tabs)

const eventSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: TYPES, required: true },
    url: { type: String, required: true, maxlength: 2000 },
    timestamp: { type: Date, required: true },
    // click only
    x: Number, // page coordinates (px, include scroll offset)
    y: Number,
    page_width: Number, // full document size at click time, used to scale the heatmap
    page_height: Number,
    // page_leave only
    duration_ms: Number,
  },
  { versionKey: false }
);

eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ user_id: 1, type: 1, timestamp: -1 });
eventSchema.index({ type: 1, timestamp: -1 });
eventSchema.index({ type: 1, url: 1 });

// ---------- helpers ----------
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const since = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const oid = (id) => new mongoose.Types.ObjectId(id);

function baseFilter(type, { days, userId }) {
  const f = { type };
  if (userId) f.user_id = userId;
  if (days) f.timestamp = { $gte: since(days) };
  return f;
}

// ---------- INSERT ----------
// Validate + sanitise one raw event from the browser. user_id is added by the controller from the session.
eventSchema.statics.clean = function (e) {
  if (!e || typeof e !== 'object') return null;
  if (typeof e.session_id !== 'string' || !e.session_id || !TYPES.includes(e.type)) return null;
  if (typeof e.url !== 'string' || !e.url) return null;
  const ts = new Date(e.timestamp);
  if (Number.isNaN(ts.getTime())) return null;

  const doc = { session_id: e.session_id.slice(0, 100), type: e.type, url: e.url.slice(0, 2000), timestamp: ts };

  if (e.type === 'click') {
    if (num(e.x) === undefined || num(e.y) === undefined) return null;
    Object.assign(doc, { x: e.x, y: e.y, page_width: num(e.page_width), page_height: num(e.page_height) });
  }
  if (e.type === 'page_leave') {
    if (num(e.duration_ms) === undefined) return null;
    doc.duration_ms = Math.min(Math.max(e.duration_ms, 0), MAX_LEAVE_MS);
  }
  return doc;
};

eventSchema.statics.insertEvents = function (docs) {
  return this.insertMany(docs, { ordered: false });
};

// ---------- QUERIES (used by admin analytics) ----------
// All users: last N days (capped). One user: 200 most recent.
eventSchema.statics.getPageViews = function ({ days, userId }) {
  return this.find(baseFilter('page_view', { days, userId }))
    .sort({ timestamp: -1 })
    .limit(userId ? 200 : 5000)
    .populate('user_id', 'username')
    .lean();
};

eventSchema.statics.getClicks = function ({ days, userId, url }) {
  const f = baseFilter('click', { days, userId });
  if (url) f.url = url;
  return this.find(f, { x: 1, y: 1, page_width: 1, page_height: 1, url: 1, timestamp: 1, user_id: 1 })
    .sort({ timestamp: -1 })
    .limit(userId ? 1000 : 5000)
    .populate('user_id', 'username')
    .lean();
};

// Pages that have click data (for the heatmap selector)
eventSchema.statics.getPages = function ({ days, userId }) {
  const match = baseFilter('click', { days, userId });
  if (match.user_id) match.user_id = oid(match.user_id);
  return this.aggregate([
    { $match: match },
    { $group: { _id: '$url', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $project: { _id: 0, url: '$_id', clicks: 1 } },
  ]);
};

// Time spent per page, from page_leave events
eventSchema.statics.getPageTimes = function ({ days, userId }) {
  const match = baseFilter('page_leave', { days, userId });
  if (match.user_id) match.user_id = oid(match.user_id);
  return this.aggregate([
    { $match: match },
    { $group: { _id: '$url', visits: { $sum: 1 }, total_ms: { $sum: '$duration_ms' }, avg_ms: { $avg: '$duration_ms' } } },
    { $sort: { total_ms: -1 } },
    { $project: { _id: 0, url: '$_id', visits: 1, total_ms: 1, avg_ms: { $round: ['$avg_ms', 0] } } },
  ]);
};

module.exports = mongoose.model('Event', eventSchema);
