// src/controllers/favorite.controller.js

const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const createError = require('http-errors');

// GET /api/favorites
// Returns the list of bookmarks favorited by the current user
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'favorites', populate: { path: 'author', select: 'name' } });
    res.json(user.favorites);
  } catch (err) {
    next(err);
  }
};

// POST /api/favorites
// Body: { bookmarkId }
// Toggles favorite status for the current user
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { bookmarkId } = req.body;
    if (!bookmarkId) throw createError(400, 'bookmarkId is required');

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) throw createError(404, 'Bookmark not found');
    if (!bookmark.isPublic && bookmark.author.toString() !== req.user.id) {
      throw createError(403, 'Cannot favorite a private bookmark');
    }

    const user = await User.findById(req.user.id);
    const idx = user.favorites.findIndex(favId => favId.toString() === bookmarkId);
    let action = '';
    if (idx === -1) {
      // Add to favorites
      user.favorites.push(bookmarkId);
      action = 'added';
    } else {
      // Remove from favorites
      user.favorites.splice(idx, 1);
      action = 'removed';
    }
    await user.save();

    // Return updated list
    const updated = await User.findById(req.user.id)
      .populate({ path: 'favorites', populate: { path: 'author', select: 'name' } });
    res.json({ action, favorites: updated.favorites });
  } catch (err) {
    next(err);
  }
};