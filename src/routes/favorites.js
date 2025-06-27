// src/routes/favorites.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const favoriteController = require('../controllers/favorite.controller');

// Get current user's favorite bookmarks
// GET /api/favorites
router.get('/', authGuard, favoriteController.getFavorites);

// Toggle favorite on a bookmark
// POST /api/favorites
// Body: { bookmarkId }
router.post('/', authGuard, favoriteController.toggleFavorite);

module.exports = router;