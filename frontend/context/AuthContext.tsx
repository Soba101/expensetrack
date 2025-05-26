import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';
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

  // Check for token in AsyncStorage on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await authService.getAuthToken();
        if (token) {
          // Optionally validate token with backend if needed
          setIsAuthenticated(true);
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
      setIsAuthenticated(true);
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