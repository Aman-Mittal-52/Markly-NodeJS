// src/controllers/user.controller.js

const createError = require('http-errors');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Collection = require('../models/Collection');
const multer = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

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
      .populate('author', 'name avatarUrl');
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
      .populate({ path: 'bookmarks', populate: { path: 'author', select: 'name avatarUrl' } });
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
      role:  user.role,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/photo
exports.updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, 'No file uploaded');

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'avatars' },
      async (err, result) => {
        if (err) return next(err);
        try {
          const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatarUrl: result.secure_url },
            { new: true }
          ).select('-passwordHash');
          res.json({ avatarUrl: user.avatarUrl });
        } catch (updateErr) {
          next(updateErr);
        }
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    next(err);
  }
};