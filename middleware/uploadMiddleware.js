const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (no disk storage)
const storage = multer.memoryStorage();

// File filter for audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp3', 'audio/mp4'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter,
});

module.exports = { upload };