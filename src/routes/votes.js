// src/routes/votes.js

const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const voteController = require('../controllers/vote.controller');

// Get vote counts for a bookmark
// GET /api/votes?bookmarkId=<bookmarkId>
router.get('/', voteController.getVotes);

// Create or toggle vote for a bookmark (authenticated users only)
// POST /api/votes
// Body: { bookmarkId, type: 'upvote'|'downvote' }
router.post('/', authGuard, voteController.createVote);

module.exports = router;