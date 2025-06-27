// src/routes/admin.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const requireAdmin = require('../middleware/requireAdmin');
const adminCtrl = require('../controllers/admin.controller');

// All admin routes require both auth and admin role
router.use(authGuard, requireAdmin);

// User management
router.get('/users', adminCtrl.listUsers);
router.put('/users/:id/role', adminCtrl.updateUserRole);
router.delete('/users/:id', adminCtrl.deleteUser);

// Bookmark management
router.get('/bookmarks', adminCtrl.listBookmarks);
router.delete('/bookmarks/:id', adminCtrl.deleteBookmark);

// Comment management
router.get('/comments', adminCtrl.listComments);
router.delete('/comments/:id', adminCtrl.deleteComment);

// Collection management
router.get('/collections', adminCtrl.listCollections);
router.delete('/collections/:id', adminCtrl.deleteCollection);

module.exports = router;