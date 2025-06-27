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

// Delete a collection (owner or admin)
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