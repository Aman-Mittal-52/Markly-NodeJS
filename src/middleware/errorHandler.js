// src/middleware/errorHandler.js

const { isCelebrateError } = require('celebrate'); // if using celebrate for validation
const createError = require('http-errors');

module.exports = (err, req, res, next) => {
  // Celebrate validation errors
  if (isCelebrateError(err)) {
    const [segment, joiError] = err.details.entries().next().value;
    return res.status(400).json({
      error: 'Validation failed',
      details: joiError.details.map(d => d.message),
    });
  }

  // HTTP errors from http-errors
  if (createError.isHttpError(err)) {
    return res.status(err.status).json({ error: err.message });
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key error', details: err.keyValue });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  // Fallback 500
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};