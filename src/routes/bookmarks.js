// src/routes/bookmarks.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const bookmarkController = require('../controllers/bookmark.controller');
const multer = require('../utils/multer');

// List bookmarks (public by default, use ?publicOnly=false for all if authenticated)
// GET /api/bookmarks?tag=&page=&limit=&publicOnly=
router.get('/', bookmarkController.getBookmarks);

// Get single bookmark (increments views, enforces privacy)
// GET /api/bookmarks/:id
router.get('/:id', bookmarkController.getBookmarkById);

// Create a bookmark (authenticated users only)
// POST /api/bookmarks
// Fields: title, url, description, tags, isPublic
// File: thumbnail
router.post('/', authGuard, multer.single('thumbnail'), bookmarkController.createBookmark);

// Update a bookmark (owner only)
// PUT /api/bookmarks/:id
router.put('/:id', authGuard, bookmarkController.updateBookmark);

// Delete a bookmark (owner only)
// DELETE /api/bookmarks/:id
router.delete('/:id', authGuard, bookmarkController.deleteBookmark);

module.exports = router;