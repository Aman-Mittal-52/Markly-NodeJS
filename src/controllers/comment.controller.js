

// src/controllers/comment.controller.js

const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const createError = require('http-errors');

// GET /api/comments?bookmarkId=
exports.getComments = async (req, res, next) => {
  try {
    const { bookmarkId } = req.query;
    if (!bookmarkId) {
      throw createError(400, 'bookmarkId query parameter is required');
    }

    const comments = await Comment.find({ bookmark: bookmarkId })
      .sort('createdAt')
      .populate('author', 'name');

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// POST /api/comments
// Body: { bookmarkId, content }
exports.createComment = async (req, res, next) => {
  try {
    const { bookmarkId, content } = req.body;
    if (!bookmarkId || !content) {
      throw createError(400, 'bookmarkId and content are required');
    }

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) throw createError(404, 'Bookmark not found');
    if (!bookmark.isPublic && bookmark.author.toString() !== req.user.id) {
      throw createError(403, 'Cannot comment on a private bookmark');
    }

    const comment = new Comment({
      bookmark: bookmarkId,
      author: req.user.id,
      content
    });
    await comment.save();

    res.status(201).json(await comment.populate('author', 'name'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id
// Admin or comment author
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) throw createError(404, 'Comment not found');

    // Allow admin (handled in route) or the author
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      throw createError(403, 'Not authorized to delete this comment');
    }

    await comment.remove();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


