// src/controllers/subscription.controller.js

const User = require('../models/User');
const createError = require('http-errors');

/**
 * GET /api/subscriptions
 * Returns the list of users the current user is subscribed to.
 */
exports.getSubscriptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subscriptions', 'name email avatarUrl');
    res.json(user.subscriptions);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/subscriptions
 * Toggles subscription to another user.
 * Body: { userId: string }
 */
exports.toggleSubscription = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      throw createError(400, 'userId is required');
    }
    if (req.user.id === userId) {
      throw createError(400, 'Cannot subscribe to yourself');
    }

    const target = await User.findById(userId);
    if (!target) {
      throw createError(404, 'Target user not found');
    }

    const user = await User.findById(req.user.id);
    const idx = user.subscriptions.findIndex(
      id => id.toString() === userId
    );

    let action;
    if (idx === -1) {
      user.subscriptions.push(userId);
      action = 'subscribed';
    } else {
      user.subscriptions.splice(idx, 1);
      action = 'unsubscribed';
    }
    await user.save();

    // Return updated subscriptions list
    const updated = await User.findById(req.user.id)
      .populate('subscriptions', 'name email avatarUrl');
    res.json({ action, subscriptions: updated.subscriptions });
  } catch (err) {
    next(err);
  }
};