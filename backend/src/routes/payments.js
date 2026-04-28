const router = require('express').Router();
const { createPaymentIntent, createCreditIntent, webhook } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/webhook', webhook); // Raw body - sem auth
router.post('/intent', authenticate, createPaymentIntent);
router.post('/credit-intent', authenticate, createCreditIntent);

module.exports = router;
