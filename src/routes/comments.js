// src/routes/comments.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const requireAdmin = require('../middleware/requireAdmin');
const commentController = require('../controllers/comment.controller');

// List comments for a bookmark
// GET /api/comments?bookmarkId=<bookmarkId>
router.get('/', commentController.getComments);

// Create a new comment on a bookmark (authenticated users only)
// POST /api/comments
// Body: { bookmarkId, content }
router.post('/', authGuard, commentController.createComment);

// Delete a comment (author or admin)
// DELETE /api/comments/:id
router.delete('/:id', authGuard, commentController.deleteComment);

module.exports = router;