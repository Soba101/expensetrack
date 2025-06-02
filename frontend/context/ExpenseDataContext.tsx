import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as expenseService from '../services/expenseService';

// Types for the context
interface ExpenseDataContextType {
  // Data
  expenses: any[]; // Using any[] since getExpenses returns any[]
  summaryData: expenseService.ExpenseSummary | null;
  recentTransactions: expenseService.RecentTransaction[];
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Error states
  error: string | null;
  
  // Methods
  refreshData: () => Promise<void>;
  forceRefresh: () => Promise<void>; // Force refresh all data and clear cache
  addExpense: (expense: any) => void;
  updateExpense: (expense: any) => void;
  deleteExpense: (expenseId: string) => void;
}

// Create the context
const ExpenseDataContext = createContext<ExpenseDataContextType | undefined>(undefined);

// Provider component
interface ExpenseDataProviderProps {
  children: ReactNode;
}

export const ExpenseDataProvider: React.FC<ExpenseDataProviderProps> = ({ children }) => {
  // State for all expense-related data
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<expenseService.ExpenseSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<expenseService.RecentTransaction[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized data fetching function
  const fetchAllData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('ExpenseDataContext: Fetching all expense data...');
      
      // Fetch all data in parallel (but only once!)
      const [expensesData, summaryDataResult, recentTransactionsData] = await Promise.all([
        expenseService.getExpenses(),
        expenseService.getExpenseSummary(),
        expenseService.getRecentTransactions(20)
      ]);

      // Update all state at once
      setExpenses(expensesData);
      setSummaryData(summaryDataResult);
      setRecentTransactions(recentTransactionsData);
      
      console.log('ExpenseDataContext: All data loaded successfully');
      console.log(`- Expenses: ${expensesData.length}`);
      console.log(`- Summary data: ${summaryDataResult ? 'loaded' : 'null'}`);
      console.log(`- Recent transactions: ${recentTransactionsData.length}`);
      
    } catch (err: any) {
      console.error('ExpenseDataContext: Failed to fetch data:', err);
      setError(err.message || 'Failed to load expense data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refresh function for pull-to-refresh - memoized to prevent infinite loops
  const refreshData = React.useCallback(async () => {
    await fetchAllData(true);
  }, []);

  // Force refresh - clears all data and refetches everything - memoized
  const forceRefresh = React.useCallback(async () => {
    console.log('ExpenseDataContext: Force refreshing all data...');
    // Clear existing data first
    setExpenses([]);
    setSummaryData(null);
    setRecentTransactions([]);
    setError(null);
    // Then fetch fresh data
    await fetchAllData(false);
  }, []);

  // Optimistic updates for better UX - memoized
  const addExpense = React.useCallback((expense: any) => {
    console.log('ExpenseDataContext: Adding expense optimistically:', expense.id);
    setExpenses(prev => [expense, ...prev]);
    // Refresh all data to ensure consistency across all components
    setTimeout(() => fetchAllData(true), 100); // Small delay to avoid race conditions
  }, []);

  const updateExpense = React.useCallback((updatedExpense: any) => {
    console.log('ExpenseDataContext: Updating expense optimistically:', updatedExpense.id);
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    // Refresh all data to ensure consistency across all components
    setTimeout(() => fetchAllData(true), 100); // Small delay to avoid race conditions
  }, []);

  const deleteExpense = React.useCallback((expenseId: string) => {
    console.log('ExpenseDataContext: Deleting expense optimistically:', expenseId);
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    // Refresh all data to ensure consistency across all components
    setTimeout(() => fetchAllData(true), 100); // Small delay to avoid race conditions
  }, []);

  // Context value
  const value: ExpenseDataContextType = {
    // Data
    expenses,
    summaryData,
    recentTransactions,
    
    // Loading states
    loading,
    refreshing,
    
    // Error state
    error,
    
    // Methods
    refreshData,
    forceRefresh,
    addExpense,
    updateExpense,
    deleteExpense,
  };

  return (
    <ExpenseDataContext.Provider value={value}>
      {children}
    </ExpenseDataContext.Provider>
  );
};

// Custom hook to use the context
export const useExpenseData = (): ExpenseDataContextType => {
  const context = useContext(ExpenseDataContext);
  if (context === undefined) {
    throw new Error('useExpenseData must be used within an ExpenseDataProvider');
  }
  return context;
};

export default ExpenseDataContext; 