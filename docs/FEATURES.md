# Feature List

## 1. User Authentication ✅ COMPLETED
- ✅ **Sign up**: Secure user registration with username/password validation
- ✅ **Log in**: JWT-based authentication with persistent sessions
- ✅ **Log out**: Complete session cleanup and token removal
- ✅ **Modern UI**: Responsive login/register screens with:
  - Form validation and error handling
  - Password visibility toggle
  - Loading states and toast notifications
  - Theme-aware design (light/dark mode support)
- ✅ **Security**: Password hashing with bcrypt, JWT tokens, protected routes
- ✅ **State Management**: AuthContext for global authentication state
- ✅ **Persistence**: AsyncStorage for maintaining login sessions

## 2. Receipt Capture & Upload 🚧 IN PROGRESS
- Take a photo of a receipt using the device camera or select an image from the gallery (image picker integration).
- Upload an image or PDF of a receipt from your device.
- After uploading, review and edit extracted data before saving as an expense.

## 3. OCR & Data Extraction 📋 PLANNED
- Use OCR to extract text from receipts.
- Parse text to identify date, amount, vendor, and other details.

## 4. Expense Logging 📋 PLANNED
- Store extracted data as an expense entry.
- Allow manual editing of extracted fields before saving.

## 5. Expense Management 📋 PLANNED
- View, edit, and delete expenses.
- Categorize expenses (e.g., food, travel).
- Filter and search expenses.

## 6. Reporting & Analytics 📋 PLANNED
- View summaries (monthly spend, by category, etc.).
- Export data (CSV, PDF).

## 7. Settings 📋 PLANNED
- Manage profile information.
- Set notification preferences.

---

## Legend:
- ✅ **COMPLETED**: Feature is fully implemented and tested
- 🚧 **IN PROGRESS**: Feature is partially implemented
- 📋 **PLANNED**: Feature is planned but not yet started 