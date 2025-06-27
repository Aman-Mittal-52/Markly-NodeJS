// src/controllers/vote.controller.js

const Vote = require('../models/Vote');
const Bookmark = require('../models/Bookmark');
const createError = require('http-errors');

// GET /api/votes?bookmarkId=<bookmarkId>
exports.getVotes = async (req, res, next) => {
  try {
    const { bookmarkId } = req.query;
    if (!bookmarkId) throw createError(400, 'bookmarkId query parameter is required');

    const upvotes = await Vote.countDocuments({ bookmark: bookmarkId, type: 'upvote' });
    const downvotes = await Vote.countDocuments({ bookmark: bookmarkId, type: 'downvote' });

    res.json({ upvotes, downvotes });
  } catch (err) {
    next(err);
  }
};

// POST /api/votes
// Body: { bookmarkId, type: 'upvote'|'downvote' }
exports.createVote = async (req, res, next) => {
  try {
    const { bookmarkId, type } = req.body;
    if (!bookmarkId || !['upvote', 'downvote'].includes(type)) {
      throw createError(400, 'bookmarkId and valid type are required');
    }

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) throw createError(404, 'Bookmark not found');
    if (!bookmark.isPublic && bookmark.author.toString() !== req.user.id) {
      throw createError(403, 'Cannot vote on a private bookmark');
    }

    // Check existing vote
    const existing = await Vote.findOne({ user: req.user.id, bookmark: bookmarkId });
    if (existing) {
      if (existing.type === type) {
        // Remove vote
        await existing.remove();
      } else {
        // Change vote type
        existing.type = type;
        await existing.save();
      }
    } else {
      // Create new vote
      await Vote.create({ user: req.user.id, bookmark: bookmarkId, type });
    }

    // Re-calculate counts
    const upvotes = await Vote.countDocuments({ bookmark: bookmarkId, type: 'upvote' });
    const downvotes = await Vote.countDocuments({ bookmark: bookmarkId, type: 'downvote' });

    res.json({ upvotes, downvotes });
  } catch (err) {
    next(err);
  }
};