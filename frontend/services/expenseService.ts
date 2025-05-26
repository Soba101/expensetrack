import { getAuthToken } from './authService';
import * as receiptService from './receiptService';

const API_BASE_URL = 'http://172.20.10.7:3001'; // Same as other services

// Interface for expense data
export interface ExpenseData {
  amount: number;
  description: string;
  date: string;
  category?: string;
  vendor?: string;
  receiptImage?: string; // base64 image if receipt is attached
}

// Interface for expense response
export interface ExpenseResponse {
  message: string;
  expense: {
    _id: string;
    user: string;
    amount: number;
    description: string;
    date: string;
    category?: string;
    vendor?: string;
    receiptId?: string; // Reference to receipt if one was created
    createdAt: string;
    updatedAt: string;
  };
  receipt?: any; // Receipt data if one was created
}

// Function to save expense (with optional receipt)
export const saveExpense = async (expenseData: ExpenseData): Promise<ExpenseResponse> => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    let receiptId = null;

    // If there's a receipt image, save the receipt first
    if (expenseData.receiptImage) {
      try {
        const receiptData: receiptService.ReceiptUploadData = {
          image: expenseData.receiptImage,
          date: expenseData.date,
          amount: expenseData.amount,
          description: expenseData.description,
        };

        const receiptResponse = await receiptService.uploadReceipt(receiptData);
        receiptId = receiptResponse.receipt._id;
        console.log('Receipt saved with ID:', receiptId);
      } catch (receiptError) {
        console.error('Failed to save receipt:', receiptError);
        // Continue without receipt - don't fail the entire expense save
      }
    }

    // Prepare expense data for backend
    const expensePayload = {
      amount: expenseData.amount,
      description: expenseData.description,
      date: expenseData.date,
      category: expenseData.category || '',
      vendor: expenseData.vendor || '',
      receiptId: receiptId, // Link to receipt if one was created
    };

    // Save expense to backend
    console.log('Sending expense data to:', `${API_BASE_URL}/api/expenses/`);
    console.log('Expense payload:', expensePayload);
    
    const response = await fetch(`${API_BASE_URL}/api/expenses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(expensePayload),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save expense');
    }

    return data; // Return expense data
  } catch (error) {
    console.error('Save expense error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

// Function to get all expenses for the current user
export const getExpenses = async (): Promise<any[]> => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Fetch expenses from backend
    const response = await fetch(`${API_BASE_URL}/api/expenses/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch expenses');
    }

    return data; // Return array of expenses
  } catch (error) {
    console.error('Get expenses error:', error);
    throw error;
  }
}; 