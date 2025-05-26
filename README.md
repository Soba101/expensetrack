# Track Your Expense

Track Your Expense is an app that helps you log and manage your expenses by capturing or uploading receipts. The app extracts key information from receipts using OCR and organizes your spending for easy tracking and reporting.

## 🎉 Current Status: Authentication System Complete!

**Overall Progress: ~15% Complete**

### ✅ What's Working Now:
- **User Registration & Login**: Fully functional with modern UI
- **Secure Authentication**: JWT-based with bcrypt password hashing
- **Session Management**: Persistent login with AsyncStorage
- **Responsive Design**: Beautiful UI with light/dark mode support
- **Comprehensive Testing**: 100% test coverage for authentication

### 🚧 In Development:
- Receipt upload functionality
- OCR integration
- Expense management features

---

## Features

### ✅ Completed Features:
- ✅ **User authentication** (sign up, log in, log out) - **FULLY WORKING**
- ✅ **Modern UI** with responsive design and theme support
- ✅ **Secure backend** with JWT tokens and password hashing

### 🚧 In Progress:
- 🚧 **Receipt capture/upload** (UI ready, backend integration needed)

### 📋 Planned Features:
- 📋 **OCR-based data extraction** (date, amount, vendor, etc.)
- 📋 **Manual review and editing** of extracted data
- 📋 **Expense management** (view, edit, delete, categorize)
- 📋 **Reporting and analytics** (summaries, exports)
- 📋 **Profile and settings** management

---

## 🚀 Quick Start

### Prerequisites
- Node.js (in Conda environment)
- MongoDB (local or Atlas)
- Expo CLI for React Native

### Backend Setup
```bash
cd backend
npm install
# Create .env file with MONGODB_URI, JWT_SECRET, PORT
node index.js
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

### ✅ Test the Authentication System
1. Open the app and tap "Create Account"
2. Register with username/password (min 6 characters)
3. Login with your credentials
4. Session persists between app restarts!

---

## Mobile Receipt Upload Flow (Planned)

1. User taps '**Upload Receipt**' button on the **Dashboard screen** and selects or captures an image using the device's camera or gallery.
2. The app converts the image to a base64 string.
3. The app sends the image to the backend's /api/receipts/ endpoint.
4. The backend performs OCR and returns extracted data (date, amount, vendor, etc.).
5. The app pre-fills an expense form with the extracted data.
6. The user reviews/edits the data and saves the expense.
7. The app sends the finalized data to the backend for storage.

---

## Architecture Overview

```plaintext
[User] 
   |
   v
[✅ Authentication System] ← COMPLETED
   |
   v
[🚧 Capture/Upload Receipt] ← IN PROGRESS
   |
   v
[📋 OCR & Data Extraction] ← PLANNED
   |
   v
[📋 Review/Edit Extracted Data] ← PLANNED
   |
   v
[📋 Save Expense Entry] ← PLANNED
   |
   v
[📋 Expense List/Reports] ← PLANNED
```

### Technology Stack
- **Frontend**: React Native + Expo + NativeBase
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + Supertest
- **State Management**: React Context API

---

## Entity Relationship Diagram (ERD)

```plaintext
[User] 1---* [Expense] *---1 [Receipt]
                |
                *---1 [Category]
```

---

## Development Progress

| Component | Status | Progress |
|-----------|--------|----------|
| Authentication | ✅ Complete | 100% |
| Receipt Upload | 🚧 In Progress | 30% |
| OCR Integration | 📋 Planned | 0% |
| Expense Management | 📋 Planned | 0% |
| Reporting | 📋 Planned | 0% |

---

## Next Development Steps

### Immediate Priority:
1. **Complete Receipt Upload Flow**: Image processing and backend integration
2. **OCR Integration**: Text extraction from receipts
3. **Expense Management**: CRUD operations for expenses

### Documentation
Comprehensive documentation available in the `/docs` folder:
- Setup guides and testing instructions
- API reference and architecture details
- Security notes and feature specifications

---

## Testing

### Backend Tests (Working)
```bash
cd backend
npm test  # All authentication tests passing ✅
```

### Manual Testing
The authentication system is fully testable:
- User registration with validation
- Secure login/logout functionality
- Session persistence across app restarts

---

## Considerations
- Privacy & security ✅ **Implemented for auth**
- OCR accuracy and manual correction 📋 **Planned**
- Multi-currency support 📋 **Planned**
- Recurring expenses 📋 **Planned**
- Cloud storage 📋 **Planned**
- Offline mode 📋 **Planned**
- Accessibility 📋 **Planned**

---

## License
MIT 