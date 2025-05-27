// Receipt model for ExpenseTrack
// Stores user reference, base64 image, date, amount, and description

const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String, // base64 string
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: false, // Made optional since OCR can extract this
  },
  description: {
    type: String,
    default: '',
  },
  vendor: {
    type: String,
    default: '',
  },
  processed: {
    type: Boolean,
    default: false,
  },
  extractedData: {
    type: Object,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Receipt', ReceiptSchema); 