const express = require('express');
const { transcribeAudioHandler } = require('../controllers/audioController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/transcribe', protect, upload.single('audio'), transcribeAudioHandler);
router.post('/translate', protect, async (req, res) => {
  // For future text translation endpoint
  res.status(501).json({ message: 'Translation endpoint coming soon' });
});

module.exports = router;