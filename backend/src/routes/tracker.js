const router = require('express').Router();
const tracker = require('../controllers/tracker');
const adminAuth = require('../middleware/adminAuth');
const { eventLimiter } = require('../middleware/rateLimit');

// public: the browser sends events here (authorised by a valid session_id)
router.post('/events', eventLimiter, tracker.ingest);

// admin only: analytics reads
router.get('/users/pageview', adminAuth, tracker.pageViews);
router.get('/users/click', adminAuth, tracker.clicks);
router.get('/users/pages', adminAuth, tracker.pages);
router.get('/users/pagetime', adminAuth, tracker.pageTimes);

module.exports = router;
