const express = require('express');
const router = express.Router();

// In-memory storage for rooms (in production, use database)
let rooms = ['general', 'random', 'tech'];

// Get list of available rooms
router.get('/rooms', (req, res) => {
  res.status(200).json({ rooms });
});

module.exports = router;