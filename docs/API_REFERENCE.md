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

## Receipts

### Upload Receipt
- **POST** `/api/receipts/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "image": base64 string, "date": ISO date string, "amount": number, "description": string }`
- **Response:** `201 Created` with receipt object or error message

### List Receipts
- **GET** `/api/receipts/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with array of receipts

---

## Error Codes
- `400` Bad Request (e.g., invalid credentials, duplicate user)
- `401` Unauthorized (e.g., missing/invalid token)
- `500` Server Error

---

*All endpoints return JSON responses. Authentication is required for all `/api/receipts` routes.* 