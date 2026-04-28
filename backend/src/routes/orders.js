const router = require('express').Router();
const { calculateOrder, createOrder, getUserOrders, getOrderById } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.post('/calculate', authenticate, calculateOrder);
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);

module.exports = router;
