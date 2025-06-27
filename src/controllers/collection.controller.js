// src/controllers/collection.controller.js

const Collection = require('../models/Collection');
const Bookmark = require('../models/Bookmark');
const createError = require('http-errors');

// GET /api/collections?authorId=&page=&limit=&publicOnly=
exports.getCollections = async (req, res, next) => {
  try {
    const { authorId, page = 1, limit = 20, publicOnly = 'true' } = req.query;
    const filter = {};
    if (authorId) filter.author = authorId;
    if (publicOnly === 'true') filter.isPublic = true;

    const skip = (page - 1) * limit;
    const collections = await Collection.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(+limit)
      .populate('author', 'name');
    res.json(collections);
  } catch (err) {
    next(err);
  }
};

// GET /api/collections/:id
exports.getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id)
      .populate('author', 'name')
      .populate({ path: 'bookmarks', populate: { path: 'author', select: 'name' } });
    if (!collection) throw createError(404, 'Collection not found');
    if (!collection.isPublic && (!req.user || req.user.id !== collection.author._id.toString())) {
      throw createError(403, 'Collection is private');
    }
    res.json(collection);
  } catch (err) {
    next(err);
  }
};

// POST /api/collections
// Body: { name, description, isPublic }
exports.createCollection = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) throw createError(400, 'name is required');

    const coll = new Collection({
      name,
      description: description || '',
      author: req.user.id,
      isPublic: isPublic !== undefined ? isPublic === 'true' : true
    });
    await coll.save();
    res.status(201).json(coll);
  } catch (err) {
    next(err);
  }
};

// PUT /api/collections/:id
// Body: { name, description, isPublic }
exports.updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coll = await Collection.findById(id);
    if (!coll) throw createError(404, 'Collection not found');
    if (coll.author.toString() !== req.user.id) throw createError(403, 'Not allowed');

    const { name, description, isPublic } = req.body;
    if (name) coll.name = name;
    if (description) coll.description = description;
    if (isPublic !== undefined) coll.isPublic = isPublic === 'true';

    await coll.save();
    res.json(coll);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/collections/:id
exports.deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coll = await Collection.findById(id);
    if (!coll) throw createError(404, 'Collection not found');
    if (coll.author.toString() !== req.user.id && req.user.role !== 'admin') throw createError(403, 'Not allowed');
    await coll.remove();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// POST /api/collections/:id/bookmarks/:bmId
exports.addBookmarkToCollection = async (req, res, next) => {
  try {
    const { id, bmId } = req.params;
    const coll = await Collection.findById(id);
    if (!coll) throw createError(404, 'Collection not found');
    if (coll.author.toString() !== req.user.id) throw createError(403, 'Not allowed');

    const bookmark = await Bookmark.findById(bmId);
    if (!bookmark) throw createError(404, 'Bookmark not found');
    if (!bookmark.isPublic && bookmark.author.toString() !== req.user.id) throw createError(403, 'Cannot add private bookmark');

    if (!coll.bookmarks.includes(bmId)) {
      coll.bookmarks.push(bmId);
      await coll.save();
    }
    res.json(coll);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/collections/:id/bookmarks/:bmId
exports.removeBookmarkFromCollection = async (req, res, next) => {
  try {
    const { id, bmId } = req.params;
    const coll = await Collection.findById(id);
    if (!coll) throw createError(404, 'Collection not found');
    if (coll.author.toString() !== req.user.id && req.user.role !== 'admin') throw createError(403, 'Not allowed');

    coll.bookmarks = coll.bookmarks.filter(b => b.toString() !== bmId);
    await coll.save();
    res.json(coll);
  } catch (err) {
    next(err);
  }
};


// src/routes/collections.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/collection.controller');

// List collections (public only by default)
// GET /api/collections?authorId=&page=&limit=&publicOnly=
router.get('/', ctrl.getCollections);

// Get single collection
// GET /api/collections/:id
router.get('/:id', authGuard, ctrl.getCollectionById);

// Create a collection
// POST /api/collections
router.post('/', authGuard, ctrl.createCollection);

// Update a collection
// PUT /api/collections/:id
router.put('/:id', authGuard, ctrl.updateCollection);

// Delete a collection
// DELETE /api/collections/:id
router.delete('/:id', authGuard, ctrl.deleteCollection);

// Add bookmark to collection
// POST /api/collections/:id/bookmarks/:bmId
router.post('/:id/bookmarks/:bmId', authGuard, ctrl.addBookmarkToCollection);

// Remove bookmark from collection
// DELETE /api/collections/:id/bookmarks/:bmId
router.delete('/:id/bookmarks/:bmId', authGuard, ctrl.removeBookmarkFromCollection);

// Admin: remove any collection
router.delete('/:id', authGuard, requireAdmin, ctrl.deleteCollection);

module.exports = router;
