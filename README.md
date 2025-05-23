# Track Your Expense

Track Your Expense is an app that helps you log and manage your expenses by capturing or uploading receipts. The app extracts key information from receipts using OCR and organizes your spending for easy tracking and reporting.

---

## Features
- User authentication (sign up, log in, log out)
- Capture or upload receipt images
- OCR-based data extraction (date, amount, vendor, etc.)
- Manual review and editing of extracted data
- Expense management (view, edit, delete, categorize)
- Reporting and analytics (summaries, exports)
- Profile and settings management

---

## Mobile Receipt Upload Flow

1. User taps 'Upload Receipt' and selects or captures an image using the device's camera or gallery.
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

### Component Diagram
- Frontend (Mobile/Web)
- Backend API
- Database
- OCR Service

---

## Entity Relationship Diagram (ERD)

```plaintext
[User] 1---* [Expense] *---1 [Receipt]
                |
                *---1 [Category]
```

---

## Sequence Diagram (Receipt Logging)

```plaintext
User -> App: Uploads or captures receipt
App -> OCR Service: Sends image
OCR Service -> App: Returns extracted text
App: Parses text, pre-fills expense form
User -> App: Reviews/edits, saves expense
App -> Backend: Stores expense and receipt
Backend -> DB: Saves data
```

---

## Setup Instructions

1. Clone the repository
2. Install dependencies (to be specified)
3. Run the app (to be specified)

---

## Next Steps
- Finalize requirements and tech stack
- Create UI wireframes
- Build authentication and receipt upload flow
- Integrate OCR and expense management

---

## Considerations
- Privacy & security
- OCR accuracy and manual correction
- Multi-currency support
- Recurring expenses
- Cloud storage
- Offline mode
- Accessibility
- Testing

---

## License
MIT 