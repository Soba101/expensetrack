// Expense routes for ExpenseTrack
// Handles creating and listing expenses

const express = require('express');
const Expense = require('../models/Expense');
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

// Create a new expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, description, date, category, vendor, receiptId } = req.body;
    
    // Validate required fields
    if (!amount || !description || !date) {
      return res.status(400).json({ message: 'Amount, description, and date are required' });
    }

    const expense = new Expense({
      user: req.user.userId,
      amount,
      description,
      date,
      category: category || '',
      vendor: vendor || '',
      receiptId: receiptId || null,
    });
    
    await expense.save();
    res.status(201).json({ message: 'Expense created', expense });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List expenses for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get expenses with optional receipt population
    const expenses = await Expense.find({ user: req.user.userId })
      .populate('receiptId') // Include receipt data if available
      .sort({ date: -1 }); // Sort by date, newest first
    
    res.json(expenses);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific expense by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    }).populate('receiptId');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (err) {
    console.error('Get expense error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 