// src/controllers/user.controller.js

const createError = require('http-errors');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Collection = require('../models/Collection');

// GET /api/users/:id/bookmarks
exports.getUserBookmarks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw createError(404, 'User not found');

    const isOwner = req.user && req.user.id === id;
    const filter = { author: id };
    if (!isOwner) filter.isPublic = true;

    const bookmarks = await Bookmark.find(filter)
      .sort('-createdAt')
      .populate('author', 'name');
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/collections
exports.getUserCollections = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw createError(404, 'User not found');

    const isOwner = req.user && req.user.id === id;
    const filter = { author: id };
    if (!isOwner) filter.isPublic = true;

    const collections = await Collection.find(filter)
      .sort('-createdAt')
      .populate('bookmarks');
    res.json(collections);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me
exports.getOwnProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) throw createError(404, 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
exports.updateOwnProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) throw createError(404, 'User not found');

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) throw createError(409, 'Email already in use');
      user.email = email;
    }
    if (name) user.name = name;
    if (password) await user.setPassword(password);

    await user.save();
    res.json({
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role
    });
  } catch (err) {
    next(err);
  }
};