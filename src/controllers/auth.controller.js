// src/controllers/auth.controller.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// helper: sign JWT
const signToken = user =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createError(400, 'name, email, and password are required');
    }
    if (await User.findOne({ email })) {
      throw createError(409, 'Email already in use');
    }

    const user = new User({ name, email, role: 'user' });
    await user.setPassword(password);
    await user.save();

    res.status(201).json({
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        avatarUrl: user.avatarUrl
      },
      token: signToken(user)
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createError(400, 'email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) throw createError(404, 'Account not found');
    const valid = await user.validatePassword(password);
    if (!valid) throw createError(401, 'Incorrect password');

    res.json({
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        avatarUrl: user.avatarUrl
      },
      token: signToken(user)
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google/callback
// (invoked by Passport)
exports.googleCallback = (req, res) => {
  const { user, token } = req.user;
  // For SPA: redirect with token, or just return JSON:
  res.json({
    user: {
      id:        user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      avatarUrl: user.avatarUrl
    },
    token
  });
};