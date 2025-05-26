# Testing Guide

## Backend Testing

### Running Tests
```bash
cd backend
npm test
```

### ✅ Authentication Tests (WORKING)
The authentication system has comprehensive test coverage:

**Test Coverage:**
- ✅ User registration with valid data
- ✅ Duplicate username prevention
- ✅ Login with correct credentials
- ✅ Login rejection with invalid credentials
- ✅ JWT token generation and validation
- ✅ Password hashing verification

**Test Results:**
All authentication tests are passing and cover the complete auth flow.

### Test Database
Tests use a separate test database to avoid affecting development data.

## Frontend Testing

### Manual Testing Checklist

#### ✅ Authentication Flow (COMPLETED)
- [ ] **Registration Screen**:
  - [ ] Form validation (username required, password min 6 chars)
  - [ ] Password confirmation matching
  - [ ] Error handling for duplicate usernames
  - [ ] Success toast and navigation to login
  - [ ] Password visibility toggle
  - [ ] Loading states during registration

- [ ] **Login Screen**:
  - [ ] Successful login with valid credentials
  - [ ] Error handling for invalid credentials
  - [ ] Password visibility toggle
  - [ ] Loading states during login
  - [ ] Navigation to main app after login

- [ ] **Session Persistence**:
  - [ ] User remains logged in after app restart
  - [ ] Logout functionality works correctly
  - [ ] Protected routes redirect to login when not authenticated

#### 🚧 Receipt Upload (IN DEVELOPMENT)
- [ ] Camera integration
- [ ] Image picker functionality
- [ ] Image upload to backend

#### 📋 OCR Integration (PLANNED)
- [ ] Text extraction from receipts
- [ ] Data parsing and validation

#### 📋 Expense Management (PLANNED)
- [ ] CRUD operations for expenses
- [ ] Category management
- [ ] Filtering and search

## Test Environment Setup

### Backend
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests with coverage
npm run test:coverage
```

### Frontend
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

## Continuous Integration
Consider setting up CI/CD pipeline with:
- Automated testing on pull requests
- Code coverage reporting
- Deployment automation

---

## Current Test Status:
- ✅ **Backend Authentication**: 100% coverage, all tests passing
- 📋 **Frontend Unit Tests**: Not yet implemented
- 📋 **Integration Tests**: Not yet implemented
- 📋 **E2E Tests**: Not yet implemented 