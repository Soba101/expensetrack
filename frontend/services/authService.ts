import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.18.70:3001'; // Backend API URL (using local network IP for simulator)
const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

// Function to store the authentication token and user data
export const storeAuthData = async (token: string, user: any) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Function to retrieve the authentication token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// Function to retrieve user data
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

// Function to remove authentication data (logout)
export const removeAuthData = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing auth data:', error);
  }
};

// Function to handle user login
export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle login errors (e.g., invalid credentials)
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user data
    await storeAuthData(data.token, data.user);

    return data; // Return token and user data
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

// Function to handle user registration
export const register = async (username: string, password: string, role = 'user') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle registration errors (e.g., username already exists)
      throw new Error(data.message || 'Registration failed');
    }

    return data; // Return success message or user data if applicable
  } catch (error) {
    console.error('Registration error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
}; 