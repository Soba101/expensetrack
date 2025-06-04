# ExpenseTrack Backend

Node.js/Express backend for the ExpenseTrack mobile application with MongoDB database and JWT authentication.

## 🔧 Recent Fixes

### Authentication Middleware Centralization
**Fixed:** Duplicate authentication middleware causing `req.user.id` to be undefined

#### Problem:
- Individual route files had their own `authMiddleware` functions
- JWT payload structure mismatch: token contained `userId` but routes expected `id`
- Inconsistent user ID handling across different endpoints

#### Solution:
- ✅ Centralized authentication in `middleware/auth.js`
- ✅ Proper JWT payload mapping: `req.user.id = decoded.userId`
- ✅ All routes now import and use the same auth middleware

#### Files Updated:
- `routes/expenses.js` - Removed local auth, imported centralized
- `routes/receipts.js` - Removed local auth, imported centralized
- `routes/categories.js` - Enhanced with period filtering
- `middleware/auth.js` - Centralized authentication logic

## 🏗 Architecture

### Authentication Flow
```
1. User logs in → JWT token generated with userId
2. Client sends requests with Authorization: Bearer <token>
3. Centralized auth middleware validates token
4. Sets req.user = { id: decoded.userId, email: decoded.email }
5. Routes access user ID via req.user.id
```

### Database Schema
- **Users**: Authentication and profile data
- **Expenses**: User expenses with category references
- **Categories**: User-specific expense categories
- **Receipts**: OCR-processed receipt images

## 📡 API Endpoints

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Categories API
Enhanced with flexible time period filtering:

```javascript
// Get all-time category statistics (default)
GET /api/categories

// Get current month category statistics  
GET /api/categories?period=current-month

// Response format
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Food & Dining",
      "currentMonthSpent": 830.02,
      "currentMonthTransactions": 14,
      "period": "all-time"
    }
  ],
  "period": "all-time"
}
```

### Debug Logging
Comprehensive logging for troubleshooting:

```bash
🔍 GET /api/expenses/ - Debug info:
  - req.user: { id: '6840b07a1d9a7be3308ee96c', email: undefined }
  - req.user.id: 6840b07a1d9a7be3308ee96c
  - Found expenses count: 50

🔍 GET /api/categories/ - Debug info:
  - Date range (all-time): All expenses included
  - Category "Food & Dining": 14 transactions, $830.02
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Start development server
npm run dev

# Or production server
npm start
```

### Environment Variables
```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/expensetrack
JWT_SECRET=your-secret-key-here
PORT=3001
```

### Database Seeding
```bash
# Populate with sample data
npm run seed
```

## 🔍 Troubleshooting

### Common Issues

#### Authentication Errors
```bash
# Error: req.user.id is undefined
# Solution: ✅ Fixed - All routes use centralized auth middleware

# Error: JWT malformed
# Check token format and Bearer prefix
```

#### Data Inconsistency
```bash
# Error: Categories show 0 transactions despite having expenses
# Solution: ✅ Fixed - Proper user ID mapping from JWT payload
```

### Debug Mode
Enable detailed logging by checking console output for:
- Request user information
- Database query results
- Authentication token validation
- Category statistics calculation

## 📁 Project Structure

```
backend/
├── middleware/
│   └── auth.js              # Centralized authentication
├── models/
│   ├── User.js             # User schema
│   ├── Expense.js          # Expense schema
│   ├── Category.js         # Category schema
│   └── Receipt.js          # Receipt schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── expenses.js         # Expense CRUD operations
│   ├── categories.js       # Category management
│   └── receipts.js         # Receipt upload/processing
├── scripts/
│   └── seedDatabase.js     # Database seeding
└── index.js                # Server entry point
```

## 🧪 Testing

### Manual Testing
```bash
# Test authentication
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/expenses

# Test categories with period filtering
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/categories?period=all-time
```

### Sample Data
Use the seeding script to populate with realistic test data:
- 4 sample users with different roles
- 200+ expenses across all users
- 60+ receipts with sample images
- 15 different categories

## 🔐 Security

### JWT Authentication
- Tokens expire after 24 hours
- Secure token validation with error handling
- User-specific data isolation

### Data Protection
- User data is isolated by userId
- Input validation on all endpoints
- Error handling without sensitive data exposure

## 📈 Performance

### Database Optimization
- Indexed queries for user-specific data
- Efficient aggregation for category statistics
- Proper ObjectId handling for MongoDB queries

### Caching
- Consider implementing Redis for session management
- Category statistics could be cached for better performance 