import { getAuthToken } from './authService';
import * as receiptService from './receiptService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001'; // Backend API URL (using localhost for better compatibility)

// Add a callback for handling authentication errors
let onAuthError: (() => void) | null = null;

// Function to set the auth error callback (will be called from AuthContext)
export const setAuthErrorCallback = (callback: () => void) => {
  onAuthError = callback;
};

// Helper function to handle authentication errors
const handleAuthError = () => {
  console.log('🔒 Authentication error detected - token expired or invalid');
  if (onAuthError) {
    onAuthError(); // This will trigger logout in AuthContext
  }
};

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

// Interface for category data
export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  currentMonthSpent?: number;
  currentMonthTransactions?: number;
  budgetUsed?: number;
}

// Interface for creating/updating categories
export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  budget?: number;
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

// Interface for time period options
export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

// Interface for trend data point
export interface TrendDataPoint {
  date: string;
  amount: number;
  count: number;
}

// Interface for vendor analytics
export interface VendorAnalytics {
  name: string;
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  lastTransaction: string;
  categories: string[];
}

// Interface for category analytics
export interface CategoryAnalytics {
  name: string;
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

// Interface for reports analytics data
export interface ReportsAnalytics {
  summary: {
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    topCategory: string;
    topVendor: string;
  };
  trends: TrendDataPoint[];
  categories: CategoryAnalytics[];
  vendors: VendorAnalytics[];
  timePeriod: TimePeriod;
}

// ===== CATEGORY MANAGEMENT FUNCTIONS =====

// Get all categories for the current user
export const getCategoriesWithStats = async (): Promise<Category[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create category');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (categoryId: string, categoryData: Partial<CategoryFormData>): Promise<Category> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update category');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete category');
    }
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};

// Initialize default categories for new users
export const initializeDefaultCategories = async (): Promise<Category[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initialize categories');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Initialize categories error:', error);
    throw error;
  }
};

// Reorder categories
export const reorderCategories = async (categoryIds: string[]): Promise<void> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ categoryIds }),
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reorder categories');
    }
  } catch (error) {
    console.error('Reorder categories error:', error);
    throw error;
  }
};

// ===== EXISTING FUNCTIONS =====

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

    // Handle authentication errors (token expired/invalid)
    if (response.status === 401) {
      console.log('🔒 Token expired or invalid - triggering logout');
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

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

// Function to update an existing expense
export const updateExpense = async (expenseId: string, expenseData: ExpenseData): Promise<any> => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Prepare expense data for backend (similar to saveExpense but without receipt handling for now)
    const expensePayload = {
      amount: expenseData.amount,
      description: expenseData.description,
      date: expenseData.date,
      category: expenseData.category || '',
      vendor: expenseData.vendor || '',
    };

    // Update expense on backend
    console.log('Updating expense with ID:', expenseId);
    console.log('Update payload:', expensePayload);
    
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(expensePayload),
    });

    console.log('Update response status:', response.status);

    // Handle authentication errors (token expired/invalid)
    if (response.status === 401) {
      console.log('🔒 Token expired or invalid - triggering logout');
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update expense');
    }

    return data.expense || data; // Return updated expense data
  } catch (error) {
    console.error('Update expense error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

// Function to delete an expense by ID
export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    console.log('deleteExpense: Starting for ID:', expenseId);
    
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Delete expense from backend
    const url = `${API_BASE_URL}/api/expenses/${expenseId}`;
    console.log('deleteExpense: Deleting from URL:', url);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('deleteExpense: Response received, status:', response.status);

    // Handle authentication errors (token expired/invalid)
    if (response.status === 401) {
      console.log('🔒 Token expired or invalid - triggering logout');
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    // Handle not found
    if (response.status === 404) {
      throw new Error('Expense not found');
    }

    if (!response.ok) {
      const data = await response.json();
      console.log('deleteExpense: Response not ok, data:', data);
      throw new Error(data.message || 'Failed to delete expense');
    }

    console.log('deleteExpense: Success');
  } catch (error) {
    console.error('Delete expense error:', error);
    throw error;
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

    // Handle authentication errors (token expired/invalid)
    if (response.status === 401) {
      console.log('🔒 Token expired or invalid - triggering logout');
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

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

// Function to get a single expense by ID
export const getExpenseById = async (expenseId: string): Promise<any> => {
  try {
    console.log('getExpenseById: Starting for ID:', expenseId);
    
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Fetch single expense from backend
    const url = `${API_BASE_URL}/api/expenses/${expenseId}`;
    console.log('getExpenseById: Fetching from URL:', url);
    
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

    console.log('getExpenseById: Response received, status:', response.status);

    // Handle authentication errors (token expired/invalid)
    if (response.status === 401) {
      console.log('🔒 Token expired or invalid - triggering logout');
      handleAuthError();
      throw new Error('Your session has expired. Please log in again.');
    }

    // Handle not found
    if (response.status === 404) {
      throw new Error('Expense not found');
    }

    const data = await response.json();
    console.log('getExpenseById: Data parsed:', data);

    if (!response.ok) {
      console.log('getExpenseById: Response not ok, data:', data);
      throw new Error(data.message || 'Failed to fetch expense');
    }

    console.log('getExpenseById: Success, returning data');
    return data; // Return single expense object
  } catch (error) {
    console.error('Get expense by ID error:', error);
    throw error;
  }
};

// Function to get expense summary and analytics
export const getExpenseSummary = async (): Promise<ExpenseSummary> => {
  try {
    const expenses = await getExpenses();
    
    // Use rolling 30-day window instead of strict calendar month
    // This ensures users see their expenses immediately after saving
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    const currentYear = now.getFullYear();
    
    // Filter expenses for last 30 days (recent spending)
    const recentExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= thirtyDaysAgo;
    });
    
    // Filter expenses for previous 30 days (30-60 days ago)
    const previousPeriodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= sixtyDaysAgo && expenseDate < thirtyDaysAgo;
    });
    
    // Filter expenses for current year
    const currentYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const recentSpent = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousPeriodSpent = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentYearSpent = currentYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate daily average based on actual days with expenses
    const daysWithExpenses = recentExpenses.length > 0 ? 30 : 1; // Avoid division by zero
    const dailyAverage = recentSpent / daysWithExpenses;
    const projectedSpending = dailyAverage * 30; // Project for 30 days
    
    // Calculate category breakdown
    const categoryTotals: { [key: string]: number } = {};
    recentExpenses.forEach(expense => {
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
    const budget = Math.max(recentSpent * 1.2, previousPeriodSpent * 1.1, 1500);
    
    return {
      currentMonth: {
        spent: recentSpent,
        budget: budget,
        lastMonth: previousPeriodSpent,
        dailyAverage: dailyAverage,
        daysInMonth: 30, // Using 30 days for rolling window
        daysPassed: 30, // Using 30 days for rolling window
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

// Function to get analytics data for reports screen
export const getReportsAnalytics = async (timePeriod: TimePeriod = 'month'): Promise<ReportsAnalytics> => {
  try {
    const expenses = await getExpenses();
    
    // Calculate date range based on time period
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case 'week':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      case 'year':
        startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Filter expenses by time period
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate;
    });
    
    // Calculate summary statistics
    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const transactionCount = filteredExpenses.length;
    const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;
    
    // Generate trend data (daily aggregation)
    const trendData = generateTrendData(filteredExpenses, timePeriod);
    
    // Generate category analytics
    const categoryAnalytics = generateCategoryAnalytics(filteredExpenses, expenses);
    
    // Generate vendor analytics
    const vendorAnalytics = generateVendorAnalytics(filteredExpenses);
    
    // Find top category and vendor
    const topCategory = categoryAnalytics.length > 0 ? categoryAnalytics[0].name : 'None';
    const topVendor = vendorAnalytics.length > 0 ? vendorAnalytics[0].name : 'None';
    
    return {
      summary: {
        totalSpent,
        transactionCount,
        averageTransaction,
        topCategory,
        topVendor
      },
      trends: trendData,
      categories: categoryAnalytics,
      vendors: vendorAnalytics,
      timePeriod
    };
  } catch (error) {
    console.error('Get reports analytics error:', error);
    throw error;
  }
};

// Helper function to generate trend data
const generateTrendData = (expenses: any[], timePeriod: TimePeriod): TrendDataPoint[] => {
  // Group expenses by date
  const dailyData: { [key: string]: { amount: number; count: number } } = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date).toISOString().split('T')[0]; // YYYY-MM-DD format
    if (!dailyData[date]) {
      dailyData[date] = { amount: 0, count: 0 };
    }
    dailyData[date].amount += expense.amount;
    dailyData[date].count += 1;
  });
  
  // Convert to array and sort by date
  const trendPoints = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // For longer periods, aggregate by week or month to reduce data points
  if (timePeriod === 'quarter' || timePeriod === 'year' || timePeriod === 'all') {
    return aggregateByWeek(trendPoints);
  }
  
  return trendPoints;
};

// Helper function to aggregate trend data by week
const aggregateByWeek = (dailyData: TrendDataPoint[]): TrendDataPoint[] => {
  const weeklyData: { [key: string]: { amount: number; count: number } } = {};
  
  dailyData.forEach(point => {
    const date = new Date(point.date);
    const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { amount: 0, count: 0 };
    }
    weeklyData[weekKey].amount += point.amount;
    weeklyData[weekKey].count += point.count;
  });
  
  return Object.entries(weeklyData)
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Helper function to generate category analytics
const generateCategoryAnalytics = (currentExpenses: any[], allExpenses: any[]): CategoryAnalytics[] => {
  // Calculate current period category totals
  const categoryTotals: { [key: string]: { amount: number; count: number } } = {};
  
  currentExpenses.forEach(expense => {
    const category = expense.category || 'Other';
    if (!categoryTotals[category]) {
      categoryTotals[category] = { amount: 0, count: 0 };
    }
    categoryTotals[category].amount += expense.amount;
    categoryTotals[category].count += 1;
  });
  
  // Calculate previous period for trend analysis
  const currentPeriodStart = currentExpenses.length > 0 
    ? new Date(Math.min(...currentExpenses.map(e => new Date(e.date).getTime())))
    : new Date();
  const periodLength = Date.now() - currentPeriodStart.getTime();
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodLength);
  
  const previousExpenses = allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= previousPeriodStart && expenseDate < currentPeriodStart;
  });
  
  const previousCategoryTotals: { [key: string]: number } = {};
  previousExpenses.forEach(expense => {
    const category = expense.category || 'Other';
    previousCategoryTotals[category] = (previousCategoryTotals[category] || 0) + expense.amount;
  });
  
  // Calculate total for percentages
  const totalSpent = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);
  
  // Category colors
  const categoryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  // Convert to analytics format
  const analytics = Object.entries(categoryTotals)
    .map(([name, data], index) => {
      const previousAmount = previousCategoryTotals[name] || 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (data.amount > previousAmount * 1.1) {
        trend = 'up';
      } else if (data.amount < previousAmount * 0.9) {
        trend = 'down';
      }
      
      return {
        name,
        totalSpent: data.amount,
        transactionCount: data.count,
        averageAmount: data.amount / data.count,
        percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        trend,
        color: categoryColors[index % categoryColors.length]
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);
  
  return analytics;
};

// Helper function to generate vendor analytics
const generateVendorAnalytics = (expenses: any[]): VendorAnalytics[] => {
  const vendorData: { [key: string]: {
    amount: number;
    count: number;
    lastDate: string;
    categories: Set<string>;
  } } = {};
  
  expenses.forEach(expense => {
    const vendor = expense.vendor || 'Unknown';
    if (!vendorData[vendor]) {
      vendorData[vendor] = {
        amount: 0,
        count: 0,
        lastDate: expense.date,
        categories: new Set()
      };
    }
    
    vendorData[vendor].amount += expense.amount;
    vendorData[vendor].count += 1;
    vendorData[vendor].categories.add(expense.category || 'Other');
    
    // Update last transaction date if this one is more recent
    if (new Date(expense.date) > new Date(vendorData[vendor].lastDate)) {
      vendorData[vendor].lastDate = expense.date;
    }
  });
  
  // Convert to analytics format and sort by total spent
  return Object.entries(vendorData)
    .map(([name, data]) => ({
      name,
      totalSpent: data.amount,
      transactionCount: data.count,
      averageAmount: data.amount / data.count,
      lastTransaction: data.lastDate,
      categories: Array.from(data.categories)
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10); // Top 10 vendors
};

// Function to export expense data (for future export functionality)
export const exportExpenseData = async (timePeriod: TimePeriod = 'all'): Promise<string> => {
  try {
    const analytics = await getReportsAnalytics(timePeriod);
    const expenses = await getExpenses();
    
    // Filter expenses by time period
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case 'week':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      case 'year':
        startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate;
    });
    
    // Create CSV format
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Vendor'];
    const csvRows = [headers.join(',')];
    
    filteredExpenses.forEach(expense => {
      const row = [
        expense.date,
        `"${expense.description}"`,
        expense.amount.toString(),
        expense.category || 'Other',
        expense.vendor || 'Unknown'
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Export expense data error:', error);
    throw error;
  }
}; 