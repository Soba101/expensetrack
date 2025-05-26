# Project Overview

## Purpose
Track Your Expense is designed to help users easily log, manage, and analyze their expenses by capturing or uploading receipts. The app uses OCR to extract key information from receipts, making expense tracking fast and accurate.

## Goals
- Simplify expense logging with receipt capture/upload
- Automate data extraction using OCR
- Provide clear, actionable insights into spending
- Ensure data privacy and security

## Main Features
- User authentication ✅ **COMPLETED**
- Receipt capture (camera) and upload (image/PDF) 🚧 **IN PROGRESS**
- OCR-based data extraction 📋 **PLANNED**
- Manual review and editing of extracted data 📋 **PLANNED**
- Expense management (CRUD, categorization) 📋 **PLANNED**
- Reporting and analytics 📋 **PLANNED**
- Profile and settings management 📋 **PLANNED**

## Current Status
**Overall Progress: ~15% Complete**

### ✅ What's Working:
- **User Registration & Login**: Fully functional with modern UI
- **Authentication System**: JWT-based with persistent sessions
- **Security**: Password hashing, protected routes, token management
- **UI/UX**: Responsive design with light/dark mode support

### 🚧 Next Steps:
1. Implement receipt upload functionality
2. Integrate OCR service for data extraction
3. Build expense management features
4. Add reporting and analytics

## Technology Stack
- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT tokens with bcrypt
- **UI Library**: NativeBase
- **State Management**: React Context API 