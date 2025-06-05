// Receipt routes for ExpenseTrack
// Handles uploading and listing receipts

const express = require('express');
const Receipt = require('../models/Receipt');
const authMiddleware = require('../middleware/auth'); // Import centralized auth middleware
const ocrService = require('../services/ocrService');

const router = express.Router();

// Upload a new receipt
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { image, date, amount, description } = req.body;
    const receipt = new Receipt({
      user: req.user.id,
      image,
      date,
      amount,
      description,
    });
    await receipt.save();
    res.status(201).json({ message: 'Receipt uploaded', receipt });
  } catch (err) {
    console.error('❌ Receipt upload failed:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List receipts for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user.id }).sort({ date: -1 });
    res.json(receipts);
  } catch (err) {
    console.error('❌ Get receipts failed:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific receipt by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // First try to find receipt with current schema (has user field)
    let receipt = await Receipt.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (receipt) {
      // Found receipt with current schema
      return res.json(receipt);
    }
    
    // If not found, try to find legacy receipt (without user field)
    // This handles old receipts that might not have user association
    const legacyReceipt = await Receipt.findOne({ _id: req.params.id });
    
    if (!legacyReceipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    // Check if this is a legacy receipt format (has filename/mimetype/data)
    if (legacyReceipt.filename && legacyReceipt.mimetype && legacyReceipt.data) {
      // Transform legacy format to current format for API response
      const transformedReceipt = {
        _id: legacyReceipt._id,
        user: req.user.id,
        image: `data:${legacyReceipt.mimetype};base64,${legacyReceipt.data}`,
        date: legacyReceipt.createdAt || new Date(),
        amount: 0, // Legacy receipts might not have amount
        description: legacyReceipt.filename || 'Legacy Receipt',
        vendor: '',
        processed: false,
        createdAt: legacyReceipt.createdAt,
        updatedAt: legacyReceipt.updatedAt
      };
      
      console.log('📄 Serving legacy receipt with transformed format');
      return res.json(transformedReceipt);
    }
    
    // If receipt exists but doesn't match current user and isn't legacy format
    return res.status(404).json({ message: 'Receipt not found' });
    
  } catch (err) {
    console.error('Receipt fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Process receipt with OCR
router.post('/:id/process', authMiddleware, async (req, res) => {
  try {
    console.log(`🔍 Processing receipt ${req.params.id} for user ${req.user.id}`);
    
    // Find the receipt and verify ownership
    const receipt = await Receipt.findOne({
      _id: req.params.id,
      user: req.user.id
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