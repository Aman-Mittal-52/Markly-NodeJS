// src/models/Collection.js

const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookmarks: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Bookmark' }
  ],
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);