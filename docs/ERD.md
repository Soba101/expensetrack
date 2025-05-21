# Entity Relationship Diagram (ERD)

## Diagram

```plaintext
[User] 1---* [Expense] *---1 [Receipt]
                |
                *---1 [Category]
```

## Entities
- **User:** id, name, email, password_hash, etc.
- **Expense:** id, user_id, receipt_id, category_id, amount, date, vendor, notes, etc.
- **Receipt:** id, file_path, ocr_text, etc.
- **Category:** id, name

## Relationships
- A user can have many expenses.
- Each expense is linked to one receipt and one category.
- Each receipt can be linked to multiple expenses (if split).
- Each category can be linked to multiple expenses. 