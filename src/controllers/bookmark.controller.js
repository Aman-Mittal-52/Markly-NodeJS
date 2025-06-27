// src/controllers/bookmark.controller.js

const Bookmark = require('../models/Bookmark');
const createError = require('http-errors');
const cloudinary = require('../utils/cloudinary');

// GET /api/bookmarks?tag=&page=&limit=
exports.getBookmarks = async (req, res, next) => {
  try {
    const { tag, page = 1, limit = 20, publicOnly = 'true' } = req.query;
    const filter = { isPublic: publicOnly === 'true' };
    if (tag) filter.tags = tag;

    const skip = (page - 1) * limit;
    const bookmarks = await Bookmark.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(+limit)
      .populate('author', 'name');

    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookmarks/:id
exports.getBookmarkById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');
    if (!bookmark) throw createError(404, 'Bookmark not found');
    if (!bookmark.isPublic && (!req.user || req.user.id.toString() !== bookmark.author._id.toString())) {
      throw createError(403, 'Bookmark is private');
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
};

// POST /api/bookmarks
// expects: title, url, description, tags (comma-separated)
// file: thumbnail
exports.createBookmark = async (req, res, next) => {
  try {
    const { title, url, description, tags, isPublic } = req.body;
    if (!title || !url) throw createError(400, 'title and url are required');

    let thumbnailUrl = '';
    if (req.file) {
      const upload = await cloudinary.uploader.upload_stream({ folder: 'bookmarks' }, (err, result) => {
        if (err) throw err;
        thumbnailUrl = result.secure_url;
      });
      // stream buffer
      const streamifier = require('streamifier');
      streamifier.createReadStream(req.file.buffer).pipe(upload);
    }

    const bm = new Bookmark({
      title,
      url,
      description: description || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      thumbnailUrl,
      author: req.user.id,
      isPublic: isPublic === 'false' ? false : true
    });
    await bm.save();
    res.status(201).json(bm);
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookmarks/:id
exports.updateBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bm = await Bookmark.findById(id);
    if (!bm) throw createError(404, 'Bookmark not found');
    if (bm.author.toString() !== req.user.id) throw createError(403, 'Not allowed');

    const { title, url, description, tags, isPublic } = req.body;
    if (title) bm.title = title;
    if (url) bm.url = url;
    if (description) bm.description = description;
    if (tags) bm.tags = tags.split(',').map(t => t.trim());
    if (typeof isPublic !== 'undefined') bm.isPublic = isPublic === 'true';

    await bm.save();
    res.json(bm);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bm = await Bookmark.findById(id);
    if (!bm) throw createError(404, 'Bookmark not found');
    if (bm.author.toString() !== req.user.id) throw createError(403, 'Not allowed');

    await bm.remove();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};