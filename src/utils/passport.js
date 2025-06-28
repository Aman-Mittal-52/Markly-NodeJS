// src/utils/passport.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Helper to issue our JWT
const jwt = require('jsonwebtoken');
const signToken = user =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.PUBLIC_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // profile contains: id, displayName, photos, emails[0].value, etc.
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name:      profile.displayName,
          email,
          role:      'user',
          avatarUrl: profile.photos[0].value
        });
        // set random password so local login is disabled
        await user.setPassword(Math.random().toString(36).slice(-8));
        await user.save();
      } else {
        // update avatar if missing/changed
        if (profile.photos[0].value && user.avatarUrl !== profile.photos[0].value) {
          user.avatarUrl = profile.photos[0].value;
          await user.save();
        }
      }
      // Instead of storing in session, we’ll pass user along
      const token = signToken(user);
      return done(null, { user, token });
    } catch (err) {
      return done(err);
    }
  }
));