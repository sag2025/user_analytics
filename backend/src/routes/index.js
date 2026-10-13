const router = require('express').Router();

router.use('/users', require('./user'));
router.use('/admin', require('./admin'));
router.use('/', require('./tracker'));

module.exports = router;
