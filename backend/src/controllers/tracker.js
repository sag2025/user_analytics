const mongoose = require('mongoose');
const Event = require('../models/Event');
const Session = require('../models/Session');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const MAX_BATCH = 50;

function parseDays(v, fallback) {
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 90) throw new AppError(400, 'days must be an integer between 1 and 90');
  return n;
}
function parseUserId(v) {
  if (!v) return null;
  if (!mongoose.isValidObjectId(v)) throw new AppError(400, 'Invalid user_id');
  return v;
}
// all users -> last 7 days by default; one user -> days only if asked for
function filters(q) {
  const userId = parseUserId(q.user_id);
  return { userId, days: parseDays(q.days, userId ? null : 7) };
}

// POST /api/events  (one event or an array). The user is derived from the session, never trusted from the client.
exports.ingest = asyncHandler(async (req, res) => {
  const raw = Array.isArray(req.body) ? req.body : [req.body];
  if (raw.length > MAX_BATCH) throw new AppError(400, `Too many events (max ${MAX_BATCH})`);

  const cleaned = raw.map((e) => Event.clean(e)).filter(Boolean);
  if (!cleaned.length) throw new AppError(400, 'No valid events');

  const sessions = await Session.findValid([...new Set(cleaned.map((e) => e.session_id))]);
  const owner = new Map(sessions.map((s) => [s.session_id, s.user_id]));
  const docs = cleaned.filter((e) => owner.has(e.session_id)).map((e) => ({ ...e, user_id: owner.get(e.session_id) }));
  if (!docs.length) throw new AppError(401, 'Invalid or expired session');

  await Event.insertEvents(docs);
  res.status(201).json({ stored: docs.length });
});

exports.pageViews = asyncHandler(async (req, res) => res.json(await Event.getPageViews(filters(req.query))));

exports.clicks = asyncHandler(async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url : undefined;
  res.json(await Event.getClicks({ ...filters(req.query), url }));
});

exports.pages = asyncHandler(async (req, res) => res.json(await Event.getPages(filters(req.query))));

exports.pageTimes = asyncHandler(async (req, res) => res.json(await Event.getPageTimes(filters(req.query))));
