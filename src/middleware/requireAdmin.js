// src/middleware/requireAdmin.js

const createError = require('http-errors');

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(createError(403, 'Admin privileges required'));
  }
  next();
};