// Main entry point for the backend server
// Loads environment variables, sets up Express, and connects to MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON and enabling CORS
app.use(express.json({ limit: '10mb' })); // Allow large payloads for base64 images
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);

// Basic route for health check
app.get('/', (req, res) => {
  res.send('ExpenseTrack backend is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add more routes and models as needed 