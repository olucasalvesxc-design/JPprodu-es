const router = require('express').Router();
const { listVoices, getAllVoices, createVoice, updateVoice, deleteVoice } = require('../controllers/voiceController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { uploadDemo } = require('../config/cloudinary');

router.get('/', listVoices); // Público
router.get('/all', authenticate, requireAdmin, getAllVoices);
router.post('/', authenticate, requireAdmin, uploadDemo.single('audio'), createVoice);
router.put('/:id', authenticate, requireAdmin, uploadDemo.single('audio'), updateVoice);
router.delete('/:id', authenticate, requireAdmin, deleteVoice);

module.exports = router;
