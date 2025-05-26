// Expense model for ExpenseTrack
// Stores user reference, amount, description, date, category, vendor, and optional receipt reference

const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    default: '',
    trim: true,
  },
  vendor: {
    type: String,
    default: '',
    trim: true,
  },
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
    default: null, // Optional - expense can exist without receipt
  },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema); 