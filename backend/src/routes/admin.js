const router = require('express').Router();
const {
  getDashboard, getAllOrders, updateOrderStatus, uploadAudioFinal,
  getAllUsers, adjustCredits, getReports,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { uploadAudio } = require('../config/cloudinary');

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/audio', uploadAudio.single('audio'), uploadAudioFinal);
router.get('/users', getAllUsers);
router.patch('/users/:id/credits', adjustCredits);
router.get('/reports', getReports);

module.exports = router;
