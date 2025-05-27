// Receipt routes for ExpenseTrack
// Handles uploading and listing receipts

const express = require('express');
const Receipt = require('../models/Receipt');
const jwt = require('jsonwebtoken');
const ocrService = require('../services/ocrService');

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

// Get a specific receipt by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Process receipt with OCR
router.post('/:id/process', authMiddleware, async (req, res) => {
  try {
    console.log(`🔍 Processing receipt ${req.params.id} for user ${req.user.userId}`);
    
    // Find the receipt
    const receipt = await Receipt.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    // Check if receipt has an image
    if (!receipt.image) {
      return res.status(400).json({ message: 'Receipt has no image to process' });
    }
    
    // Process the receipt image with OCR
    const extractedData = await ocrService.extractReceiptData(receipt.image);
    
    // Update receipt with extracted data
    receipt.processed = true;
    receipt.extractedData = extractedData;
    
    // Update receipt fields if they weren't already set and OCR found them
    if (!receipt.amount && extractedData.amount) {
      receipt.amount = extractedData.amount;
    }
    if (!receipt.description && extractedData.vendor) {
      receipt.description = extractedData.vendor;
    }
    
    await receipt.save();
    
    console.log('✅ Receipt processed successfully');
    res.json({
      message: 'Receipt processed successfully',
      receipt,
      extractedData
    });
    
  } catch (err) {
    console.error('❌ Receipt processing failed:', err.message);
    res.status(500).json({ 
      message: 'OCR processing failed', 
      error: err.message 
    });
  }
});

// Test OCR service endpoint
router.get('/test/ocr', authMiddleware, async (req, res) => {
  try {
    const testResult = await ocrService.testOCR();
    res.json(testResult);
  } catch (err) {
    res.status(500).json({ 
      message: 'OCR test failed', 
      error: err.message 
    });
  }
});

module.exports = router; 