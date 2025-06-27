// src/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const config = require('./config');

// Import routers
const authRoutes         = require('./routes/auth');
const bookmarkRoutes     = require('./routes/bookmarks');
const userRoutes         = require('./routes/users');
const commentRoutes      = require('./routes/comments');
const voteRoutes         = require('./routes/votes');
const favoriteRoutes     = require('./routes/favorites');
const subscriptionRoutes = require('./routes/subscriptions');
const collectionRoutes   = require('./routes/collections');
const adminRoutes        = require('./routes/admin');
const seoRoutes          = require('./routes/seo');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (robots.txt, sitemap.xml) from /public
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/admin', adminRoutes);

// SEO endpoints (sitemap.xml, robots.txt)
app.use('/', seoRoutes);

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start the server
mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 Server listening on port ${config.port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });