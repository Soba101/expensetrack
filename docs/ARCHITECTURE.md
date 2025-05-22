# Architecture

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