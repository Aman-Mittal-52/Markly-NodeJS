// src/models/Comment.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  bookmark: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);