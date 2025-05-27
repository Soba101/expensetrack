# ExpenseTrack Backend API Reference

## Authentication

### Register
- **POST** `/api/auth/register`
- **Body:** `{ "username": string, "password": string, "role": "admin" | "user" }`
- **Response:** `201 Created` or error message

### Login
- **POST** `/api/auth/login`
- **Body:** `{ "username": string, "password": string }`
- **Response:** `{ token, user: { username, role } }` or error message

---

## Expenses ✅ **IMPLEMENTED**

### Create Expense
- **POST** `/api/expenses/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "amount": number, "description": string, "date": ISO date string, "category": string, "vendor": string, "receiptImage": base64 string }`
- **Response:** `201 Created` with expense object or error message

### Get All Expenses
- **GET** `/api/expenses/`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** 
  - `search`: string (optional) - Search across description, vendor, category
  - `category`: string (optional) - Filter by category
  - `sortBy`: "date" | "amount" | "description" (optional)
  - `sortOrder`: "asc" | "desc" (optional)
  - `page`: number (optional) - Pagination
  - `limit`: number (optional) - Items per page
- **Response:** `200 OK` with array of expenses

### Get Expense by ID
- **GET** `/api/expenses/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with expense object or `404 Not Found`

### Update Expense
- **PUT** `/api/expenses/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "amount": number, "description": string, "date": ISO date string, "category": string, "vendor": string }`
- **Response:** `200 OK` with updated expense object or error message

### Delete Expense
- **DELETE** `/api/expenses/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with success message or error message

---

## Receipts ✅ **IMPLEMENTED**

### Upload Receipt
- **POST** `/api/receipts/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "image": base64 string, "date": ISO date string, "amount": number, "description": string }`
- **Response:** `201 Created` with receipt object or error message

**Note:** The client (mobile app) uses Expo ImagePicker to select or capture a receipt image, converts it to a base64 string, and sends it in the `image` field of the request body.

### List Receipts
- **GET** `/api/receipts/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with array of receipts

### Get Receipt by ID
- **GET** `/api/receipts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with receipt object or `404 Not Found`

### Process Receipt (OCR) ✅ **IMPLEMENTED**
- **POST** `/api/receipts/:id/process`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with extracted data or error message
- **Response Format:**
```json
{
  "success": true,
  "data": {
    "amount": number | null,
    "date": "YYYY-MM-DD" | null,
    "vendor": string | null,
    "category": string,
    "confidence": {
      "amount": number (0-1),
      "date": number (0-1),
      "vendor": number (0-1)
    },
    "rawText": string
  }
}
```

### Test OCR Service
- **GET** `/api/receipts/test/ocr`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with OCR service status

---

## Categories ✅ **IMPLEMENTED**

### Get All Categories
- **GET** `/api/categories/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with array of categories

### Create Category
- **POST** `/api/categories/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "name": string, "color": string, "icon": string }`
- **Response:** `201 Created` with category object or error message

### Update Category
- **PUT** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "name": string, "color": string, "icon": string }`
- **Response:** `200 OK` with updated category object or error message

### Delete Category
- **DELETE** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with success message or error message

---

## Analytics 📋 **PLANNED**

### Get Spending Summary
- **GET** `/api/analytics/summary`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `period`: "week" | "month" | "year" (optional)
  - `startDate`: ISO date string (optional)
  - `endDate`: ISO date string (optional)
- **Response:** `200 OK` with spending summary
- **Status:** 📋 Planned

### Get Category Breakdown
- **GET** `/api/analytics/categories`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** Same as summary
- **Response:** `200 OK` with category breakdown
- **Status:** 📋 Planned

### Get Spending Trends
- **GET** `/api/analytics/trends`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** Same as summary
- **Response:** `200 OK` with trend data
- **Status:** 📋 Planned

---

## Data Export 📋 **PLANNED**

### Export to CSV
- **GET** `/api/export/csv`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** Date range and filter options
- **Response:** CSV file download
- **Status:** 📋 Planned

### Export to PDF
- **GET** `/api/export/pdf`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** Report type and options
- **Response:** PDF file download
- **Status:** 📋 Planned

---

## Error Codes
- `400` Bad Request (e.g., invalid credentials, duplicate user, validation errors)
- `401` Unauthorized (e.g., missing/invalid token)
- `403` Forbidden (e.g., accessing other user's data)
- `404` Not Found (e.g., expense/receipt not found)
- `409` Conflict (e.g., duplicate category name)
- `422` Unprocessable Entity (e.g., invalid data format)
- `500` Server Error

---

## API Status Summary

**Overall API Completion: 90%** ⬆️

| Endpoint Category | Status | Completion |
|------------------|--------|------------|
| Authentication | ✅ Complete | 100% |
| Expenses | ✅ Complete | 95% |
| Receipts | ✅ Complete | 100% |
| OCR Processing | ✅ Complete | 95% |
| Categories | ✅ Complete | 90% |
| Analytics | 📋 Planned | 20% |
| Data Export | 📋 Planned | 0% |

---

## Request/Response Examples

### Create Expense Example
```json
POST /api/expenses/
{
  "amount": 25.99,
  "description": "Lunch at restaurant",
  "date": "2024-01-15T12:30:00.000Z",
  "category": "Food & Dining",
  "vendor": "Local Restaurant",
  "receiptImage": "data:image/jpeg;base64,..."
}

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "amount": 25.99,
  "description": "Lunch at restaurant",
  "date": "2024-01-15T12:30:00.000Z",
  "category": "Food & Dining",
  "vendor": "Local Restaurant",
  "userId": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-15T12:35:00.000Z",
  "updatedAt": "2024-01-15T12:35:00.000Z"
}
```

### Search Expenses Example
```
GET /api/expenses/?search=restaurant&category=Food%20%26%20Dining&sortBy=date&sortOrder=desc&page=1&limit=10
```

---

*All endpoints return JSON responses. Authentication is required for all protected routes. The API follows RESTful conventions and includes comprehensive error handling.* 