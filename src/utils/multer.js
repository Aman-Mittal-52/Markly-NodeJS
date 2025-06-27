// src/utils/multer.js

const multer = require('multer');

// Use memory storage so files are available as Buffer for Cloudinary upload
const storage = multer.memoryStorage();

module.exports = multer({ storage });