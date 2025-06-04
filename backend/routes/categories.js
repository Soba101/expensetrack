const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/categories - Get all categories for the authenticated user
// Returns categories sorted by order, with spending statistics
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id })
      .sort({ order: 1, name: 1 });

    // Calculate spending statistics for each category (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const stats = await category.getSpendingForPeriod(startOfMonth, endOfMonth);
        
        return {
          _id: category._id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget,
          order: category.order,
          isDefault: category.isDefault,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          currentMonthSpent: stats.totalSpent,
          currentMonthTransactions: stats.transactionCount,
          budgetUsed: category.budget ? (stats.totalSpent / category.budget) * 100 : 0
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithStats
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// POST /api/categories - Create a new category
// Body: { name, icon, color, budget? }
router.post('/', async (req, res) => {
  try {
    const { name, icon, color, budget } = req.body;

    // Validate required fields
    if (!name || !icon || !color) {
      return res.status(400).json({
        success: false,
        message: 'Name, icon, and color are required'
      });
    }

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      name: name.trim(),
      userId: req.user.id
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create new category
    const category = new Category({
      name: name.trim(),
      icon,
      color,
      budget: budget || null,
      userId: req.user.id
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// PUT /api/categories/:id - Update an existing category
// Body: { name?, icon?, color?, budget? }
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, budget } = req.body;

    // Find category and verify ownership
    const category = await Category.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing categories
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        userId: req.user.id,
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields if provided
    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (budget !== undefined) category.budget = budget || null;

    await category.save();

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// DELETE /api/categories/:id - Delete a category
// Note: Prevents deletion if expenses exist for this category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find category and verify ownership
    const category = await Category.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any expenses use this category
    const expenseCount = await Expense.countDocuments({
      category: category.name,
      userId: req.user.id
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${expenseCount} expense(s) are using this category.`,
        expenseCount
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// POST /api/categories/reorder - Reorder categories
// Body: { categoryIds: [id1, id2, id3, ...] }
router.post('/reorder', async (req, res) => {
  try {
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'categoryIds must be an array'
      });
    }

    // Update order for each category
    const updatePromises = categoryIds.map((categoryId, index) =>
      Category.findOneAndUpdate(
        { _id: categoryId, userId: req.user.id },
        { order: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories',
      error: error.message
    });
  }
});

// POST /api/categories/initialize - Initialize default categories for user
// This endpoint is called when a user first accesses categories
router.post('/initialize', async (req, res) => {
  try {
    // Check if user already has categories
    const existingCount = await Category.countDocuments({ userId: req.user.id });
    
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: 'Categories already initialized',
        count: existingCount
      });
    }

    // Create default categories
    const defaultCategories = Category.getDefaultCategories();
    const categoriesToCreate = defaultCategories.map((cat, index) => ({
      ...cat,
      userId: req.user.id,
      isDefault: true,
      order: index
    }));

    const createdCategories = await Category.insertMany(categoriesToCreate);

    res.status(201).json({
      success: true,
      data: createdCategories,
      message: `${createdCategories.length} default categories created`
    });
  } catch (error) {
    console.error('Initialize categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize categories',
      error: error.message
    });
  }
});

module.exports = router; 