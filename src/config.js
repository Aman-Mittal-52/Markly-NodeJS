// src/config.js

module.exports = {
    port:      process.env.PORT || 4000,
    mongoUri:  process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:    process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    publicUrl: process.env.PUBLIC_URL,
  };