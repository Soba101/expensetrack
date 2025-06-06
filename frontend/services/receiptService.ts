import * as FileSystem from 'expo-file-system';
import { getAuthToken } from './authService';

const API_BASE_URL = 'http://192.168.18.70:3001'; // Same as authService

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
    vendor?: string;
    processed?: boolean;
    extractedData?: OCRExtractedData;
    createdAt: string;
    updatedAt: string;
  };
}

// Interface for OCR extracted data
export interface OCRExtractedData {
  amount: number | null;
  date: string | null;
  vendor: string | null;
  category: string | null;
  confidence: {
    amount: number;
    date: number;
    vendor: number;
  };
  rawText: string;
}

// Interface for OCR processing response
export interface OCRProcessingResponse {
  message: string;
  receipt: ReceiptResponse['receipt'];
  extractedData: OCRExtractedData;
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

// Function to process receipt with OCR
export const processReceiptWithOCR = async (receiptId: string): Promise<OCRProcessingResponse> => {
  try {
    console.log('🔍 Processing receipt with OCR:', receiptId);
    
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Call OCR processing endpoint
    const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OCR processing failed');
    }

    console.log('✅ OCR processing complete:', data);
    return data;
  } catch (error) {
    console.error('❌ OCR processing error:', error);
    throw error;
  }
};

// Function to get a specific receipt by ID
export const getReceiptById = async (receiptId: string): Promise<ReceiptResponse['receipt']> => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Fetch specific receipt from backend
    const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch receipt');
    }

    return data; // Return receipt data
  } catch (error) {
    console.error('Get receipt error:', error);
    throw error;
  }
};

// Function to process uploaded receipt (legacy function - kept for compatibility)
export const processReceiptImage = async (imageUri: string) => {
  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);
    
    // Return image data for upload
    const extractedData = {
      date: new Date().toISOString(),
      amount: 0, // Will be extracted by OCR after upload
      description: 'Receipt uploaded', // Default description
      vendor: '', // Will be extracted by OCR
    };

    return {
      image: base64Image,
      extractedData: extractedData,
    };
  } catch (error) {
    console.error('Error processing receipt image:', error);
    throw error;
  }
}; 