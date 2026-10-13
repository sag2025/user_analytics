const router = require('express').Router();
const admin = require('../controllers/admin');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/login', authLimiter, admin.login);

module.exports = router;
