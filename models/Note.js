const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    sourceLanguage: {
      type: String,
      required: true,
      enum: ['en', 'ig', 'ha', 'yo'],
    },
    targetLanguage: {
      type: String,
      required: true,
      enum: ['en', 'ig', 'ha', 'yo'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', NoteSchema);