// src/middleware/authGuard.js

const jwt = require('jsonwebtoken');
const createError = require('http-errors');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'Authorization header missing'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(createError(401, 'Invalid authorization format'));
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch (err) {
    next(createError(401, 'Invalid or expired token'));
  }
};