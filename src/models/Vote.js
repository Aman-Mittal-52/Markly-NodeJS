// src/models/Vote.js

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookmark: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark',
    required: true
  },
  type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, { timestamps: true });

// Prevent a user from voting more than once per bookmark
voteSchema.index({ user: 1, bookmark: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);