# ExpenseTrack Database Schema

## User Model
- **username**: String, required, unique
- **password**: String, required (hashed)
- **role**: String, enum: ['admin', 'user'], default: 'user'
- **timestamps**: createdAt, updatedAt

## Receipt Model
- **user**: ObjectId, ref: User, required
- **image**: String, required (base64-encoded)
- **date**: Date, required
- **amount**: Number, required
- **description**: String, optional
- **timestamps**: createdAt, updatedAt

## Relationships
- Each receipt belongs to a user (user reference)
- Users can have multiple receipts 