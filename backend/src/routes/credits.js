const router = require('express').Router();
const { getBalance, getTransactions } = require('../controllers/creditController');
const { authenticate } = require('../middleware/auth');

router.get('/balance', authenticate, getBalance);
router.get('/transactions', authenticate, getTransactions);

module.exports = router;
