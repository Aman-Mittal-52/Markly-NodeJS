// src/index.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const config = require('./config');

// Initialize Passport strategies
require('./utils/passport');

const app = express();

// Enable CORS for all origins
app.use(cors());

// HTTP request logging
app.use(morgan('combined'));

// Parse JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (required by Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (robots.txt, sitemap.xml)
app.use(express.static(path.join(__dirname, '../public')));

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/users', require('./routes/user'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/admin', require('./routes/admin'));

// SEO endpoints (sitemap.xml, robots.txt)
app.use('/', require('./routes/seo'));

// Global error handler
app.use(require('./middleware/errorHandler'));

// Connect to MongoDB and start the server
mongoose.connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 Server listening on port ${config.port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });