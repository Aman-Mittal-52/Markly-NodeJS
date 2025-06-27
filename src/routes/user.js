// src/routes/users.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const userController = require('../controllers/user.controller');

// Get bookmarks for a user (public for others, all for owner)
router.get('/:id/bookmarks', authGuard, userController.getUserBookmarks);

// Get collections for a user (public for others, all for owner)
router.get('/:id/collections', authGuard, userController.getUserCollections);

// Get current user's profile
router.get('/me', authGuard, userController.getOwnProfile);

// Update current user's profile
router.put('/me', authGuard, userController.updateOwnProfile);

module.exports = router;