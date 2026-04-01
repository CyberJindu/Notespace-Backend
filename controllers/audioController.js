const { transcribeAudio } = require('../services/transcriptionService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { RATE_LIMIT } = require('../utils/constants');

// Store rate limit counts (in production use Redis)
const rateLimitStore = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userLimits = rateLimitStore.get(userId) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };
  
  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + RATE_LIMIT.windowMs;
  }
  
  if (userLimits.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, resetTime: userLimits.resetTime };
  }
  
  userLimits.count++;
  rateLimitStore.set(userId, userLimits);
  return { allowed: true, resetTime: null };
};

// Auto-retry function with exponential backoff
const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

// @desc    Transcribe and translate audio
// @route   POST /api/transcribe
// @access  Private
const transcribeAudioHandler = async (req, res) => {
  try {
    // Check rate limit
    const rateCheck = checkRateLimit(req.user._id.toString());
    if (!rateCheck.allowed) {
      res.status(429);
      throw new Error(`Rate limit exceeded. You can make ${RATE_LIMIT.maxRequests} requests per hour. Try again after ${new Date(rateCheck.resetTime).toLocaleTimeString()}`);
    }
    
    // Check if file exists
    if (!req.file) {
      res.status(400);
      throw new Error('No audio file provided');
    }
    
    const { targetLanguage } = req.body;
    
    // Validate target language
    const validLanguages = ['en', 'ig', 'ha', 'yo'];
    if (!targetLanguage || !validLanguages.includes(targetLanguage)) {
      res.status(400);
      throw new Error('Invalid target language. Must be one of: en, ig, ha, yo');
    }
    
    // Upload to Cloudinary temporarily
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      // Continue without Cloudinary if it fails (use buffer directly)
    }
    
    // Process with Gemini with auto-retry
    const result = await withRetry(async () => {
      return await transcribeAudio(
        req.file.buffer,
        req.file.mimetype,
        targetLanguage
      );
    }, 3, 1000);
    
    // Clean up Cloudinary file if uploaded
    if (cloudinaryResult?.public_id) {
      setTimeout(() => {
        deleteFromCloudinary(cloudinaryResult.public_id).catch(console.error);
      }, 5000);
    }
    
    res.json({
  ...result,
  fileName: req.file.originalname 
});
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
      message: error.message,
      sourceLanguage: 'error',
      text: `Error: ${error.message}`,
      targetLanguage: req.body?.targetLanguage || 'en'
    });
  }
};

module.exports = { transcribeAudioHandler };
