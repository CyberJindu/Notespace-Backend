const Note = require('../models/Note');

// @desc    Get all notes for current user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  
  // Check if note belongs to user
  if (note.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  res.json(note);
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  const { content, sourceLanguage, targetLanguage } = req.body;
  
  if (!content) {
    res.status(400);
    throw new Error('Content is required');
  }
  
  const note = await Note.create({
    userId: req.user._id,
    content,
    sourceLanguage: sourceLanguage || 'unknown',
    targetLanguage: targetLanguage || 'en',
    audioFileName: audioFileName || 'Untitled Recording'
  });
  
  res.status(201).json(note);
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  
  if (note.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  note.content = req.body.content || note.content;
  const updatedNote = await note.save();
  
  res.json(updatedNote);
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  
  if (note.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  await note.deleteOne();
  res.json({ message: 'Note removed' });
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
