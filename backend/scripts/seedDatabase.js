// Database seeding script for ExpenseTrack
// Populates MongoDB with realistic sample data for testing and demonstration
// Run with: node scripts/seedDatabase.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Expense = require('../models/Expense');
const Receipt = require('../models/Receipt');

// Sample base64 image for receipts (small transparent PNG)
const SAMPLE_RECEIPT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Sample users data
const SAMPLE_USERS = [
  {
    username: 'john_doe',
    password: 'password123',
    role: 'user'
  },
  {
    username: 'jane_smith',
    password: 'password123',
    role: 'user'
  },
  {
    username: 'admin_user',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'demo_user',
    password: 'demo123',
    role: 'user'
  }
];

// Sample expense categories
const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Business',
  'Personal Care',
  'Groceries',
  'Gas & Fuel',
  'Coffee & Drinks',
  'Restaurants',
  'Office Supplies'
];

// Sample vendors
const VENDORS = [
  'Starbucks',
  'McDonald\'s',
  'Walmart',
  'Target',
  'Amazon',
  'Shell Gas Station',
  'Uber',
  'Netflix',
  'Spotify',
  'Apple Store',
  'Best Buy',
  'CVS Pharmacy',
  'Whole Foods',
  'Chipotle',
  'Home Depot',
  'Office Depot',
  'Costco',
  'Trader Joe\'s',
  'Subway',
  'Pizza Hut',
  'Local Coffee Shop',
  'Grocery Store',
  'Department Store',
  'Online Store',
  'Restaurant'
];

// Sample expense descriptions
const EXPENSE_DESCRIPTIONS = [
  'Morning coffee and pastry',
  'Lunch meeting with client',
  'Weekly grocery shopping',
  'Gas for car',
  'Office supplies for project',
  'Team dinner celebration',
  'Monthly subscription renewal',
  'Taxi ride to airport',
  'Conference registration fee',
  'Business cards printing',
  'Software license renewal',
  'Client entertainment',
  'Office snacks and drinks',
  'Parking fee downtown',
  'Hotel accommodation',
  'Flight tickets',
  'Uber ride to meeting',
  'Breakfast before presentation',
  'Pharmacy prescription',
  'Gym membership',
  'Book for research',
  'Equipment maintenance',
  'Internet bill',
  'Phone bill',
  'Electricity bill',
  'Water bill',
  'Insurance payment',
  'Car maintenance',
  'Medical checkup',
  'Dental cleaning',
  'Eye exam',
  'Haircut and styling',
  'Clothing for work',
  'Shoes replacement',
  'Home repair supplies',
  'Garden supplies',
  'Pet food and supplies',
  'Gift for colleague',
  'Birthday celebration',
  'Holiday shopping'
];

// Function to generate random date within last 90 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90); // Random day within last 90 days
  const randomDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return randomDate;
}

// Function to generate random amount based on category
function getRandomAmount(category) {
  const ranges = {
    'Food & Dining': [8, 75],
    'Transportation': [5, 150],
    'Shopping': [15, 300],
    'Entertainment': [10, 100],
    'Bills & Utilities': [25, 250],
    'Healthcare': [20, 500],
    'Travel': [50, 1000],
    'Education': [30, 500],
    'Business': [25, 400],
    'Personal Care': [15, 150],
    'Groceries': [20, 200],
    'Gas & Fuel': [30, 80],
    'Coffee & Drinks': [3, 25],
    'Restaurants': [15, 120],
    'Office Supplies': [10, 100]
  };
  
  const range = ranges[category] || [10, 100];
  const min = range[0];
  const max = range[1];
  const amount = Math.random() * (max - min) + min;
  return Math.round(amount * 100) / 100; // Round to 2 decimal places
}

// Function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to create sample receipts for a user
async function createSampleReceipts(userId, count = 15) {
  const receipts = [];
  
  for (let i = 0; i < count; i++) {
    const amount = getRandomAmount(getRandomItem(CATEGORIES));
    const receipt = new Receipt({
      user: userId,
      image: SAMPLE_RECEIPT_IMAGE,
      date: getRandomDate(),
      amount: amount,
      description: getRandomItem(EXPENSE_DESCRIPTIONS)
    });
    
    const savedReceipt = await receipt.save();
    receipts.push(savedReceipt);
  }
  
  return receipts;
}

// Function to create sample expenses for a user
async function createSampleExpenses(userId, receipts, count = 50) {
  const expenses = [];
  
  for (let i = 0; i < count; i++) {
    const category = getRandomItem(CATEGORIES);
    const amount = getRandomAmount(category);
    const hasReceipt = Math.random() < 0.3; // 30% chance of having a receipt
    const receiptId = hasReceipt && receipts.length > 0 ? getRandomItem(receipts)._id : null;
    
    const expense = new Expense({
      user: userId,
      amount: amount,
      description: getRandomItem(EXPENSE_DESCRIPTIONS),
      date: getRandomDate(),
      category: category,
      vendor: getRandomItem(VENDORS),
      receiptId: receiptId
    });
    
    const savedExpense = await expense.save();
    expenses.push(savedExpense);
  }
  
  return expenses;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Expense.deleteMany({});
    await Receipt.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Create sample users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of SAMPLE_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`   ✅ Created user: ${userData.username} (${userData.role})`);
    }
    
    // Create sample data for each user
    for (const user of createdUsers) {
      console.log(`\n📊 Creating sample data for ${user.username}...`);
      
      // Create receipts
      console.log('   📄 Creating sample receipts...');
      const receipts = await createSampleReceipts(user._id, 15);
      console.log(`   ✅ Created ${receipts.length} receipts`);
      
      // Create expenses
      console.log('   💰 Creating sample expenses...');
      const expenses = await createSampleExpenses(user._id, receipts, 50);
      console.log(`   ✅ Created ${expenses.length} expenses`);
    }
    
    // Display summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   👥 Users created: ${createdUsers.length}`);
    
    const totalReceipts = await Receipt.countDocuments();
    const totalExpenses = await Expense.countDocuments();
    
    console.log(`   📄 Total receipts: ${totalReceipts}`);
    console.log(`   💰 Total expenses: ${totalExpenses}`);
    
    // Display user credentials for testing
    console.log('\n🔑 Test User Credentials:');
    SAMPLE_USERS.forEach(user => {
      console.log(`   Username: ${user.username} | Password: ${user.password} | Role: ${user.role}`);
    });
    
    console.log('\n✨ Your ExpenseTrack app is now populated with realistic sample data!');
    console.log('🚀 You can now test all features with meaningful data.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 