// src/routes/auth.js

const router = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');

// Local register & login
router.post('/register', authController.register);
router.post('/login',    authController.login);

// Google OAuth start
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

module.exports = router;