const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' }
];

const MAX_AUDIO_DURATION = 600; // 10 minutes in seconds
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
};

module.exports = {
  LANGUAGES,
  MAX_AUDIO_DURATION,
  MAX_AUDIO_SIZE,
  RATE_LIMIT
};
