const router = require('express').Router();
const { getSettings, getPublicSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/public', getPublicSettings); // Público para calculadora
router.get('/', authenticate, requireAdmin, getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);

module.exports = router;
