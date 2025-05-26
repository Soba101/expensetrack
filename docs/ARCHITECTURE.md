# Architecture Overview

## System Architecture

### Frontend (React Native + Expo)
- **Framework**: React Native with Expo for cross-platform mobile development
- **UI Library**: NativeBase for consistent, accessible components
- **State Management**: React Context API for authentication state
- **Navigation**: React Navigation for screen routing
- **Storage**: AsyncStorage for persistent user sessions
- **HTTP Client**: Fetch API for backend communication

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Testing**: Jest with Supertest for API testing
- **Environment**: dotenv for configuration management

### Database (MongoDB)
- **Users Collection**: Stores user credentials and profile data
- **Receipts Collection**: Planned for receipt and expense data
- **Categories Collection**: Planned for expense categorization

## ✅ Implemented Components

### Authentication System (COMPLETED)
```
Frontend                    Backend                     Database
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ LoginScreen     │───────▶│ /api/auth/login │───────▶│ Users Collection│
│ RegisterScreen  │        │ /api/auth/register       │                 │
│ AuthContext     │        │                 │        │ - username      │
│ AuthService     │        │ JWT Generation  │        │ - password (hash)│
│ AsyncStorage    │        │ Password Hash   │        │ - role          │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

**Features:**
- Secure user registration with validation
- JWT-based authentication with 1-day expiration
- Password hashing using bcrypt
- Persistent login sessions
- Protected route navigation
- Modern, responsive UI with theme support

## 🚧 Planned Components

### Receipt Processing Flow
```
Camera/Gallery ──▶ Image Upload ──▶ OCR Service ──▶ Data Extraction ──▶ Expense Entry
```

### Data Flow
```
User Input ──▶ Frontend Validation ──▶ API Request ──▶ Backend Processing ──▶ Database Storage
```

## Security Considerations
- ✅ **Password Security**: bcrypt hashing with salt rounds
- ✅ **Token Security**: JWT with secret key and expiration
- ✅ **Route Protection**: Authentication middleware for protected endpoints
- ✅ **Input Validation**: Frontend and backend validation
- 📋 **Planned**: Rate limiting, HTTPS enforcement, data encryption

## Scalability Considerations
- **Database**: MongoDB Atlas for cloud scaling
- **Backend**: Stateless design for horizontal scaling
- **Frontend**: Optimized React Native performance
- **Caching**: Planned for frequently accessed data

## Development Environment
- **Version Control**: Git with feature branch workflow
- **Testing**: Automated testing with Jest
- **Documentation**: Comprehensive docs in `/docs` folder
- **Code Quality**: ESLint and Prettier for consistency

## Current Status
- ✅ **Authentication Layer**: Fully implemented and tested
- 🚧 **Receipt Upload**: UI components ready, backend integration needed
- 📋 **OCR Integration**: Architecture planned, implementation pending
- 📋 **Expense Management**: Database schema designed, CRUD operations pending
- 📋 **Reporting**: Analytics architecture planned

## Technology Stack Summary
| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React Native + Expo | ✅ Setup Complete |
| UI Components | NativeBase | ✅ Implemented |
| State Management | React Context | ✅ Auth Context Working |
| Backend API | Node.js + Express | ✅ Auth Endpoints Working |
| Database | MongoDB + Mongoose | ✅ User Model Working |
| Authentication | JWT + bcrypt | ✅ Fully Implemented |
| Testing | Jest + Supertest | ✅ Auth Tests Passing |

## High-Level Flow Diagram

```plaintext
[User] 
   |
   v
[Capture/Upload Receipt]
   |
   v
[OCR & Data Extraction]
   |
   v
[Review/Edit Extracted Data]
   |
   v
[Save Expense Entry]
   |
   v
[Expense List/Reports]
```

## Component Diagram
- **Frontend (Mobile/Web):** User interface for capturing/uploading receipts, reviewing data, and viewing reports.
-   - Lets users select or capture receipt images using the device's camera or gallery.
-   - Converts images to base64 and sends them to the backend for OCR.
-   - Receives extracted data, pre-fills an expense form, and allows user review/edit before saving.
- **Backend API:** Handles authentication, expense CRUD, and OCR processing.
- **Database:** Stores users, expenses, receipts, and categories.
- **OCR Service:** Extracts text from receipt images (can be 3rd party or self-hosted).

## Component Explanations
- **Frontend:** Provides a simple, intuitive interface for all user actions.
- **Backend API:** Manages business logic, data validation, and communication between frontend, database, and OCR service.
- **Database:** Securely stores all user and expense data.
- **OCR Service:** Converts receipt images to text for data extraction. 