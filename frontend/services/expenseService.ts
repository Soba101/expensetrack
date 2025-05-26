import { getAuthToken } from './authService';
import * as receiptService from './receiptService';

const API_BASE_URL = 'http://192.168.18.70:3001'; // Updated to current IP address

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

// Interface for expense summary analytics
export interface ExpenseSummary {
  currentMonth: {
    spent: number;
    budget: number;
    lastMonth: number;
    dailyAverage: number;
    daysInMonth: number;
    daysPassed: number;
    projectedSpending: number;
  };
  yearData: {
    spent: number;
    target: number;
  };
  categories: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
}

// Interface for recent transactions
export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  vendor: string;
  hasReceipt: boolean;
  status: string;
  isUnusual: boolean;
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
    console.log('getExpenses: Starting...');
    
    // Get authentication token
    console.log('getExpenses: Getting auth token...');
    const token = await getAuthToken();
    console.log('getExpenses: Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Fetch expenses from backend
    const url = `${API_BASE_URL}/api/expenses/`;
    console.log('getExpenses: Fetching from URL:', url);
    console.log('getExpenses: Using token:', token.substring(0, 20) + '...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('getExpenses: Response received, status:', response.status);
    console.log('getExpenses: Response ok:', response.ok);

    const data = await response.json();
    console.log('getExpenses: Data parsed, type:', typeof data, 'length:', Array.isArray(data) ? data.length : 'not array');

    if (!response.ok) {
      console.log('getExpenses: Response not ok, data:', data);
      throw new Error(data.message || 'Failed to fetch expenses');
    }

    console.log('getExpenses: Success, returning data');
    return data; // Return array of expenses
  } catch (error) {
    console.error('Get expenses error:', error);
    throw error;
  }
};

// Function to get expense summary and analytics
export const getExpenseSummary = async (): Promise<ExpenseSummary> => {
  try {
    const expenses = await getExpenses();
    
    // Calculate current month data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    // Filter expenses for last month
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });
    
    // Filter expenses for current year
    const currentYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const currentMonthSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthSpent = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentYearSpent = currentYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate days and projections
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysPassed = now.getDate();
    const dailyAverage = daysPassed > 0 ? currentMonthSpent / daysPassed : 0;
    const projectedSpending = dailyAverage * daysInMonth;
    
    // Calculate category breakdown
    const categoryTotals: { [key: string]: number } = {};
    currentMonthExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });
    
    // Convert to array and add colors
    const categoryColors = [
      'blue.400', 'teal.400', 'orange.400', 'purple.400', 
      'green.400', 'red.400', 'yellow.400', 'pink.400'
    ];
    
    const categories = Object.entries(categoryTotals)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: categoryColors[index % categoryColors.length]
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories
    
    // Set a reasonable budget (you might want to make this user-configurable)
    const budget = Math.max(currentMonthSpent * 1.2, lastMonthSpent * 1.1, 1500);
    
    return {
      currentMonth: {
        spent: currentMonthSpent,
        budget: budget,
        lastMonth: lastMonthSpent,
        dailyAverage: dailyAverage,
        daysInMonth: daysInMonth,
        daysPassed: daysPassed,
        projectedSpending: projectedSpending
      },
      yearData: {
        spent: currentYearSpent,
        target: budget * 12 // Simple yearly target
      },
      categories: categories
    };
  } catch (error) {
    console.error('Get expense summary error:', error);
    throw error;
  }
};

// Function to get recent transactions formatted for the UI
export const getRecentTransactions = async (limit: number = 10): Promise<RecentTransaction[]> => {
  try {
    const expenses = await getExpenses();
    
    // Sort by date (newest first) and limit
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    
    // Transform to UI format
    return recentExpenses.map(expense => ({
      id: expense._id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category || 'Other',
      vendor: expense.vendor || '',
      hasReceipt: !!expense.receiptId,
      status: 'completed', // All saved expenses are completed
      isUnusual: expense.amount > 100 // Simple heuristic for unusual expenses
    }));
  } catch (error) {
    console.error('Get recent transactions error:', error);
    throw error;
  }
};

// Function to get unique categories from user's expenses
export const getCategories = async (): Promise<string[]> => {
  try {
    const expenses = await getExpenses();
    const categories = new Set<string>();
    
    expenses.forEach(expense => {
      if (expense.category) {
        categories.add(expense.category);
      }
    });
    
    // Add some default categories if user has no expenses yet
    const defaultCategories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
      'Business', 'Personal Care', 'Groceries', 'Other'
    ];
    
    defaultCategories.forEach(cat => categories.add(cat));
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
}; 