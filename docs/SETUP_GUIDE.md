# ExpenseTrack Setup Guide

## Prerequisites
- Node.js (installed in your Conda environment)
- MongoDB (local or Atlas)
- npm
- Expo CLI for React Native development

## Backend Setup

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd expensetrack/backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Environment Variables
Create a `.env` file in `backend/`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Start MongoDB
- If using local MongoDB, ensure it is running.
- If using Atlas, ensure your connection string is correct.

### 5. Run the Server
```sh
node index.js
```

### 6. Run Tests
```sh
npm test
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```sh
cd ../frontend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Start the Development Server
```sh
npx expo start
```

### 4. Run on Device/Simulator
- Scan QR code with Expo Go app (mobile)
- Press 'i' for iOS simulator
- Press 'a' for Android emulator

## ✅ Testing the Authentication System

The authentication system is fully functional! You can test:

1. **User Registration**:
   - Open the app and tap "Create Account"
   - Enter a username and password (min 6 characters)
   - Confirm password and register

2. **User Login**:
   - Use your registered credentials to log in
   - Session will persist between app restarts

3. **Protected Routes**:
   - Once logged in, you'll access the main app dashboard
   - Logout functionality is available in the app

## Current Status
- ✅ **Authentication**: Fully working (register, login, logout)
- 🚧 **Receipt Upload**: In development
- 📋 **OCR Integration**: Planned
- 📋 **Expense Management**: Planned

---
*All commands should be run inside your Conda environment.* 