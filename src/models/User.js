// src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Bookmark' }
  ]
}, { timestamps: true });

// Hash and set password
userSchema.methods.setPassword = async function(password) {
  const saltRounds = 10;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

// Validate password
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);