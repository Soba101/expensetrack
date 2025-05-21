# ExpenseTrack Backend Setup Guide

## Prerequisites
- Node.js (installed in your Conda environment)
- MongoDB (local or Atlas)
- npm

## 1. Clone the Repository
```sh
git clone <your-repo-url>
cd expensetrack/backend
```

## 2. Install Dependencies
```sh
npm install
```

## 3. Environment Variables
Create a `.env` file in `backend/`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 4. Start MongoDB
- If using local MongoDB, ensure it is running.
- If using Atlas, ensure your connection string is correct.

## 5. Run the Server
```sh
node index.js
```

## 6. Run Tests
```sh
npm test
```

---
*All commands should be run inside your Conda environment.* 