import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';
import * as expenseService from '../services/expenseService';
import * as receiptService from '../services/receiptService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the context data
interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean; // To indicate if we are still checking auth status on load
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  // Logout function that can be called from services
  const handleLogout = async () => {
    try {
      console.log('🔒 Logging out due to authentication error...');
      await authService.removeAuthData();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during automatic logout:', error);
    }
  };

  // Check for token in AsyncStorage on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await authService.getAuthToken();
        if (token) {
          // Set up the auth error callback for automatic logout
          expenseService.setAuthErrorCallback(handleLogout);
          receiptService.setAuthErrorCallback(handleLogout);
          
          // For now, just trust the token exists
          // In the future, we could validate it with a test API call
          setIsAuthenticated(true);
          console.log('✅ Found existing token, user authenticated');
        } else {
          console.log('❌ No token found, user needs to log in');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false); // Finished checking
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      await authService.login(username, password);
      // Set up the auth error callback after successful login
      expenseService.setAuthErrorCallback(handleLogout);
      receiptService.setAuthErrorCallback(handleLogout);
      setIsAuthenticated(true);
      console.log('✅ Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw for UI component to handle
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.removeAuthData();
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 