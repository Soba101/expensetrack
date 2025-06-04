# Changelog

All notable changes to the ExpenseTrack project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Authentication middleware inconsistency across backend routes
- Data discrepancy between expenses and categories endpoints
- User ID handling in JWT token validation

### Added
- Flexible time period filtering for categories endpoint
- Comprehensive debug logging for troubleshooting
- Enhanced API documentation with query parameters
- Troubleshooting guide for common issues

### Changed
- Categories endpoint now defaults to all-time data instead of current month
- Centralized authentication middleware for consistency
- Improved error handling and user feedback

## [1.0.0] - 2025-01-XX

### Added
- Complete React Native mobile application
- 10 fully functional screens with Apple-inspired design
- OCR receipt scanning functionality
- Smart expense categorization
- Real-time data synchronization
- Advanced filtering and search capabilities
- Budget tracking and analytics
- User authentication system
- MongoDB backend with RESTful API
- Comprehensive form validation
- Haptic feedback throughout the app
- Toast notifications for user feedback
- Pull-to-refresh functionality
- Skeleton loading states
- Error handling with retry functionality

### Technical Features
- React Native with TypeScript
- Tamagui UI component library
- React Navigation for seamless navigation
- Context API for state management
- Node.js backend with Express
- MongoDB database
- JWT authentication
- OCR API integration

### Screens Completed
1. **DashboardScreen** - Overview with stats and recent activity
2. **ExpensesListScreen** - Comprehensive expense management
3. **AddEditExpenseScreen** - Form for creating/editing expenses
4. **ExpenseDetailScreen** - Detailed expense view
5. **CategoryManagementScreen** - Category CRUD operations
6. **ReportsScreen** - Analytics and reporting dashboard
7. **ProfileScreen** - User profile management
8. **SettingsScreen** - App settings and preferences
9. **LoginScreen** - User authentication
10. **RegisterScreen** - User registration

## Recent Fixes (Latest)

### Authentication & Data Consistency Fix

#### Fixed Issues:
- **Authentication Middleware Duplication**: Removed duplicate auth middleware from individual route files
- **User ID Undefined Error**: Fixed `req.user.id` being undefined due to JWT payload structure mismatch
- **Data Inconsistency**: Resolved discrepancy where categories showed 5 transactions while expenses showed 50

#### Technical Changes:
- **Centralized Auth**: All routes now use `backend/middleware/auth.js`
- **Consistent User ID**: Proper mapping from JWT `userId` to `req.user.id`
- **Flexible Categories Endpoint**: Added `?period=all-time|current-month` query parameter
- **Default Behavior**: Categories endpoint now defaults to all-time data (matching expenses)

#### Before vs After:
```bash
# Before Fix
Categories: 5 transactions (current month only)
Expenses: 50 transactions (all time)

# After Fix  
Categories: 50 transactions (all time by default)
Expenses: 50 transactions (all time)
```

#### Files Modified:
- `backend/routes/expenses.js` - Removed local auth middleware, imported centralized version
- `backend/routes/receipts.js` - Removed local auth middleware, imported centralized version  
- `backend/routes/categories.js` - Added period parameter, defaulted to all-time
- `backend/middleware/auth.js` - Enhanced with better error handling

#### Debug Logging Added:
```bash
🔍 GET /api/categories/ - Debug info:
  - Date range (all-time): All expenses included
  - Category "Food & Dining": 14 transactions, $830.02
  - Category "Healthcare": 4 transactions, $1441.91
```

### Backward Compatibility:
- Existing API calls continue to work unchanged
- Optional `?period=current-month` parameter available for monthly budget views
- All authentication flows remain the same

### Testing Verified:
- ✅ User authentication works correctly
- ✅ Categories and expenses show matching transaction counts
- ✅ All CRUD operations function properly
- ✅ Debug logging provides clear troubleshooting information
- ✅ Both all-time and current-month filtering work as expected 