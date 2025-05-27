// Database cleanup script for ExpenseTrack
// This will remove all expenses and receipts for testing

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Receipt = require('./models/Receipt');

async function cleanupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - ID: ${user._id}`);
    });

    // Count current data
    const expenseCount = await Expense.countDocuments({});
    const receiptCount = await Receipt.countDocuments({});
    
    console.log(`\n📊 Current database state:`);
    console.log(`   - Expenses: ${expenseCount}`);
    console.log(`   - Receipts: ${receiptCount}`);

    if (expenseCount > 0 || receiptCount > 0) {
      console.log('\n🧹 Cleaning up database...');
      
      // Delete all expenses
      const deletedExpenses = await Expense.deleteMany({});
      console.log(`✅ Deleted ${deletedExpenses.deletedCount} expenses`);
      
      // Delete all receipts
      const deletedReceipts = await Receipt.deleteMany({});
      console.log(`✅ Deleted ${deletedReceipts.deletedCount} receipts`);
      
      console.log('\n🎉 Database cleanup complete!');
    } else {
      console.log('\n✨ Database is already clean!');
    }

    // Final count
    const finalExpenseCount = await Expense.countDocuments({});
    const finalReceiptCount = await Receipt.countDocuments({});
    
    console.log(`\n📊 Final database state:`);
    console.log(`   - Expenses: ${finalExpenseCount}`);
    console.log(`   - Receipts: ${finalReceiptCount}`);
    console.log(`   - Users: ${users.length} (preserved)`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupDatabase(); 