import * as FileSystem from 'expo-file-system';
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://172.20.10.7:3001'; // Same as authService

// Interface for receipt upload data
export interface ReceiptUploadData {
  image: string; // base64 string
  date: string; // ISO date string
  amount: number;
  description: string;
}

// Interface for receipt response
export interface ReceiptResponse {
  message: string;
  receipt: {
    _id: string;
    user: string;
    image: string;
    date: string;
    amount: number;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Function to convert image URI to base64 string
export const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    // Use FileSystem to read the image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Return with proper data URL format
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
};

// Function to upload receipt to backend
export const uploadReceipt = async (receiptData: ReceiptUploadData): Promise<ReceiptResponse> => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Send receipt data to backend
    const response = await fetch(`${API_BASE_URL}/api/receipts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(receiptData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle upload errors
      throw new Error(data.message || 'Receipt upload failed');
    }

    return data; // Return receipt data
  } catch (error) {
    console.error('Receipt upload error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

// Function to get all receipts for the current user
export const getReceipts = async (): Promise<any[]> => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Fetch receipts from backend
    const response = await fetch(`${API_BASE_URL}/api/receipts/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch receipts');
    }

    return data; // Return array of receipts
  } catch (error) {
    console.error('Get receipts error:', error);
    throw error;
  }
};

// Function to process uploaded receipt (placeholder for future OCR integration)
export const processReceiptImage = async (imageUri: string) => {
  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);
    
    // For now, return mock extracted data
    // In the future, this will call OCR service
    const mockExtractedData = {
      date: new Date().toISOString(),
      amount: 0, // User will need to enter manually for now
      description: 'Receipt uploaded', // Default description
      vendor: '', // Will be extracted by OCR later
    };

    return {
      image: base64Image,
      extractedData: mockExtractedData,
    };
  } catch (error) {
    console.error('Error processing receipt image:', error);
    throw error;
  }
}; 