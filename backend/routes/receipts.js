// Receipt routes for ExpenseTrack
// Handles uploading and listing receipts

const express = require('express');
const Receipt = require('../models/Receipt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT and attach user to request
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Upload a new receipt
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { image, date, amount, description } = req.body;
    const receipt = new Receipt({
      user: req.user.userId,
      image,
      date,
      amount,
      description,
    });
    await receipt.save();
    res.status(201).json({ message: 'Receipt uploaded', receipt });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List receipts for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user.userId }).sort({ date: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 