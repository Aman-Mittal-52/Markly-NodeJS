// src/controllers/admin.controller.js

const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');
const Collection = require('../models/Collection');
const createError = require('http-errors');

//
// --- USER MANAGEMENT ---
//

// GET /api/admin/users
// List all users (excluding password hashes)
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/role
// Promote or demote a user
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      throw createError(400, 'Invalid role');
    }
    const user = await User.findById(id);
    if (!user) throw createError(404, 'User not found');
    user.role = role;
    await user.save();
    res.json({ id: user._id, role: user.role });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
// Remove any user (except yourself)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      throw createError(400, 'Cannot delete yourself');
    }
    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

//
// --- CONTENT MANAGEMENT ---
//

// GET /api/admin/bookmarks
// List all bookmarks
exports.listBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find().populate('author', 'name avatarUrl');
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/bookmarks/:id
// Remove any bookmark
exports.deleteBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Bookmark.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/comments
// List all comments
exports.listComments = async (req, res, next) => {
  try {
    const comments = await Comment.find().populate('author', 'name avatarUrl');
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/comments/:id
// Remove any comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/collections
// List all collections
exports.listCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find().populate('author', 'name avatarUrl');
    res.json(collections);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/collections/:id
// Remove any collection
exports.deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Collection.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};