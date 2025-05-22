# Sequence Diagram: Receipt Logging

## Process

```plaintext
User -> App: Selects or captures receipt image (image picker)
App -> OCR Service: Sends image
OCR Service -> App: Returns extracted text
App: Parses text, pre-fills expense form
User -> App: Reviews/edits, saves expense
App -> Backend: Stores expense and receipt
Backend -> DB: Saves data
```

## Steps Explained
1. User selects or captures a receipt image using the device's image picker or camera.
2. App sends the image to the OCR service.
3. OCR service returns extracted text.
4. App parses the text and pre-fills the expense form.
5. User reviews, edits, and saves the expense.
6. App sends the data to the backend for storage.
7. Backend saves the expense and receipt in the database. 