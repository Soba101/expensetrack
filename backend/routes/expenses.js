// Expense routes for ExpenseTrack
// Handles creating and listing expenses

const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth'); // Import centralized auth middleware
const mongoose = require('mongoose'); // Add mongoose import for ObjectId conversion

const router = express.Router();

// Create a new expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, description, date, category, vendor, receiptId } = req.body;
    
    // Validate required fields
    if (!amount || !description || !date) {
      return res.status(400).json({ message: 'Amount, description, and date are required' });
    }

    // Convert string ID to ObjectId for database storage
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const expense = new Expense({
      userId: userObjectId, // Use ObjectId for consistency
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
    console.log('🔍 GET /api/expenses/ - Debug info:');
    console.log('  - req.user:', req.user);
    console.log('  - req.user.id:', req.user.id);
    console.log('  - typeof req.user.id:', typeof req.user.id);
    
    // Convert string ID to ObjectId for database query
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    console.log('  - userObjectId:', userObjectId);
    
    // Get expenses with optional receipt population
    const expenses = await Expense.find({ userId: userObjectId })
      .populate('receiptId') // Include receipt data if available
      .sort({ date: -1 }); // Sort by date, newest first
    
    console.log('  - Found expenses count:', expenses.length);
    if (expenses.length > 0) {
      console.log('  - Sample expense userId:', expenses[0].userId);
      console.log('  - Sample expense category:', expenses[0].category);
    }
    
    res.json(expenses);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific expense by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Convert string ID to ObjectId for database query
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    
    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      userId: userObjectId 
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