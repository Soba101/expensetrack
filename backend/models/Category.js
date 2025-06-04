const mongoose = require('mongoose');

// Category model for expense categorization with budgets
// Features: Custom icons, colors, monthly budgets, user-specific categories
const categorySchema = new mongoose.Schema({
  // Category name (required, unique per user)
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  
  // Ionicons icon name for visual representation
  icon: {
    type: String,
    required: [true, 'Category icon is required'],
    default: 'pricetag'
  },
  
  // Hex color code for category theming
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code'],
    default: '#3B82F6'
  },
  
  // Monthly budget amount for this category (optional)
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: null
  },
  
  // User who owns this category
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Flag to identify system default categories
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Display order for sorting categories
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique category names per user
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

// Index for efficient user-based queries
categorySchema.index({ userId: 1, order: 1 });

// Virtual for category usage statistics (will be populated when needed)
categorySchema.virtual('stats', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
});

// Instance method to calculate spending for a given period
categorySchema.methods.getSpendingForPeriod = async function(startDate, endDate) {
  const Expense = mongoose.model('Expense');
  
  const result = await Expense.aggregate([
    {
      $match: {
        categoryId: this._id,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalSpent: 0, transactionCount: 0 };
};

// Static method to get default categories for new users
categorySchema.statics.getDefaultCategories = function() {
  return [
    { name: 'Food & Dining', icon: 'restaurant', color: '#059669' },
    { name: 'Transportation', icon: 'car', color: '#DC2626' },
    { name: 'Shopping', icon: 'bag', color: '#EA580C' },
    { name: 'Entertainment', icon: 'game-controller', color: '#7C3AED' },
    { name: 'Bills & Utilities', icon: 'wifi', color: '#2563EB' },
    { name: 'Healthcare', icon: 'medical', color: '#0891B2' },
    { name: 'Travel', icon: 'airplane', color: '#7C2D12' },
    { name: 'Education', icon: 'school', color: '#1D4ED8' },
    { name: 'Business', icon: 'briefcase', color: '#374151' },
    { name: 'Personal Care', icon: 'cut', color: '#BE185D' },
    { name: 'Groceries', icon: 'basket', color: '#059669' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' }
  ];
};

// Pre-save middleware to set default order
categorySchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    this.order = count;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema); 