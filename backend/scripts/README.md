# Database Scripts

## Seeding Script

The `seedDatabase.js` script populates your MongoDB database with realistic sample data for testing and demonstration purposes.

### What it creates:

- **4 Sample Users** with different roles (3 regular users + 1 admin)
- **200+ Expenses** across all users with realistic amounts and categories
- **60+ Receipts** with sample images linked to some expenses
- **15 Different Categories** (Food, Transportation, Shopping, etc.)
- **25+ Vendors** (Starbucks, Amazon, Walmart, etc.)
- **40+ Realistic Descriptions** for various expense types

### How to run:

```bash
# From the backend directory
npm run seed

# Or directly with node
node scripts/seedDatabase.js
```

### Sample User Credentials:

After seeding, you can log in with these test accounts:

| Username | Password | Role |
|----------|----------|------|
| john_doe | password123 | user |
| jane_smith | password123 | user |
| demo_user | demo123 | user |
| admin_user | admin123 | admin |

### Features:

- **Realistic Data**: Amounts vary by category (coffee $3-25, travel $50-1000)
- **Date Distribution**: Expenses spread over the last 90 days
- **Receipt Linking**: ~30% of expenses have associated receipt images
- **Category Variety**: 15 different expense categories
- **Vendor Diversity**: 25+ different vendors and merchants

### Data Volume:

- **Total Users**: 4
- **Total Expenses**: ~200 (50 per user)
- **Total Receipts**: ~60 (15 per user)
- **Date Range**: Last 90 days
- **Amount Range**: $3 - $1000 (category-dependent)

### Safety:

⚠️ **Warning**: This script will **clear all existing data** before seeding. Comment out the deletion lines if you want to preserve existing data.

### After Seeding:

1. Start your backend server: `npm start`
2. Start your frontend app: `cd ../frontend && npx expo start`
3. Log in with any of the sample user credentials
4. Explore the app with realistic data!

Your ExpenseTrack app will now have:
- A populated dashboard with real spending data
- Expense lists with search and filter functionality
- Receipt images attached to some expenses
- Realistic spending patterns and categories
- Multiple users to test different scenarios 