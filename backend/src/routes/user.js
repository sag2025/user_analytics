const router = require('express').Router();
const user = require('../controllers/user');
const adminAuth = require('../middleware/adminAuth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, user.register);
router.post('/login', authLimiter, user.login);
router.get('/', adminAuth, user.listUsers); // admin: users for the filter dropdown

module.exports = router;
