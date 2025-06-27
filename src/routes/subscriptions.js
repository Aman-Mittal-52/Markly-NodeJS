// src/routes/subscriptions.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const subscriptionController = require('../controllers/subscription.controller');

// Get current user's subscriptions
// GET /api/subscriptions
router.get('/', authGuard, subscriptionController.getSubscriptions);

// Toggle subscription to another user
// POST /api/subscriptions
// Body: { userId }
router.post('/', authGuard, subscriptionController.toggleSubscription);

module.exports = router;