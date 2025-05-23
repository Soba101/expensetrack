# To-Do List: ExpenseTrack App

Based on the current status of the project, here are the remaining tasks:

## 1. Complete the Receipt Upload Flow:

- Implement logic to convert the selected image URI (from `expo-image-picker`) into a format suitable for sending to the backend (e.g., base64 string or form data).
- Send the image data to your backend's `/api/receipts/` endpoint (as described in `docs/API_REFERENCE.md`).
- Handle the response from the backend (which should include the extracted data after OCR).

## 2. Implement OCR Integration (Backend/Frontend):

- (Backend) Set up or integrate with an OCR service to process the uploaded image.
- (Backend) Parse the OCR results to extract key information like date, amount, vendor, etc.
- (Backend) Send the extracted data back to the frontend in the response.

## 3. Create and Populate the Add/Edit Expense Screen (from Upload):

- When the backend returns extracted data, navigate the user to the `AddEditExpenseScreen`.
- Pre-fill the form fields on the `AddEditExpenseScreen` with the extracted data.
- Allow the user to review and edit the pre-filled data.

## 4. Save Finalized Expense Data:

- On the `AddEditExpenseScreen`, implement the logic to save the finalized expense data (including any manual edits) to the backend API.

## 5. Implement Full Expense Management:

- Display a list of all expenses (beyond the mock data in the Inbox). The `ExpensesListScreen` is likely intended for this.
- Implement viewing details of an existing expense (`ExpenseDetailScreen`).
- Add functionality to edit and delete expenses.

## 6. Develop Categories Feature:

- Implement the `CategoriesScreen` to manage expense categories.
- Allow users to create, view, edit, and delete categories.
- Link expenses to categories.

## 7. Build Reporting and Analytics:

- Develop the `ReportsScreen` to display expense summaries and breakdowns (like the mock data on the Dashboard, but based on real saved expenses).
- Implement filtering and sorting of expenses for reports.
- Consider data export functionality (CSV, PDF).

## 8. Implement Settings Functionality:

- Flesh out the `SettingsScreen` with actual settings options (e.g., managing profile, currency, notifications if applicable).

## 9. Integrate User Authentication (Frontend):

- Implement the frontend UI and logic for user signup, login, and logout, interacting with the backend authentication endpoints.
- Manage user sessions (e.g., using AsyncStorage as suggested by your `colorModeManager`).
- Protect routes that require authentication. 