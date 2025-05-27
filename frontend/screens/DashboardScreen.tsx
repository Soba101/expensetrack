import React, { useState } from 'react';
import { ScrollView, useColorModeValue, Button, HStack, Box, useToast } from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ExpenseSummary from '../components/ExpenseSummary';
import RecentTransactions from '../components/RecentTransactions';

import QuickActions from '../components/QuickActions';
import UserInfo from '../components/UserInfo';
import SmartInsights from '../components/SmartInsights';
import * as ImagePicker from 'expo-image-picker';
import * as receiptService from '../services/receiptService';
import { useExpenseData } from '../context/ExpenseDataContext';

// DashboardScreen: Shows an overview of expenses and quick stats using modular components
const DashboardScreen: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const navigation = useNavigation();
  const toast = useToast();
  
  // Get refresh function from expense data context
  const { refreshData } = useExpenseData();
  
  // State for upload loading
  const [isUploading, setIsUploading] = useState(false);

  // Refresh data when screen comes into focus (e.g., returning from expense creation)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Dashboard focused - refreshing data...');
      refreshData();
    }, []) // Remove refreshData from dependencies to prevent infinite loop
  );

  // Function to pick an image from the library and upload it
  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Use the string literal 'images'
        allowsEditing: true, // Allow basic editing
        aspect: [4, 3], // Maintain a 4:3 aspect ratio
        quality: 0.8, // Good quality but smaller file size
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        
        // Start upload process
        await handleImageUpload(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to select image. Please try again.',
        duration: 3000,
      });
    }
  };

  // Function to handle image upload and save to backend
  const handleImageUpload = async (imageUri: string) => {
    setIsUploading(true);
    
    try {
      // Show loading toast
      toast.show({
        title: 'Uploading Receipt',
        description: 'Saving your receipt to the cloud...',
        duration: 2000,
      });

      // Process the image (convert to base64)
      const processedData = await receiptService.processReceiptImage(imageUri);
      
      // Save receipt to backend to get an ID for OCR processing
      const receiptUploadData: receiptService.ReceiptUploadData = {
        image: processedData.image,
        date: processedData.extractedData.date,
        amount: processedData.extractedData.amount,
        description: processedData.extractedData.description,
      };

      console.log('🔄 Uploading receipt to backend...');
      const uploadResponse = await receiptService.uploadReceipt(receiptUploadData);
      
      console.log('✅ Receipt uploaded successfully:', uploadResponse.receipt);

      // Show success message
      toast.show({
        title: '📸 Receipt Uploaded!',
        description: 'AI will now extract data automatically...',
        duration: 3000,
      });

      // Navigate to AddEditExpenseScreen with the saved receipt data (includes _id)
      (navigation as any).navigate('AddEditExpense', { 
        receiptData: uploadResponse.receipt,
        isFromUpload: true 
      });

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.show({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload receipt. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Apple-style: Add extra top padding for visual comfort and prevent card from hitting top
    <ScrollView flex={1} bg={bg} p={4} pt={16}>
      {/* User info at the top */}
      <UserInfo />
      {/* Quick actions for adding expenses or uploading receipts */}
      <QuickActions onUploadPress={pickImage} isUploading={isUploading} />
      {/* Expense summary section with enhanced design */}
      <ExpenseSummary />
      {/* Smart insights with personalized recommendations */}
      <SmartInsights />
      {/* Recent transactions list */}
      <RecentTransactions />
    </ScrollView>
  );
};

export default DashboardScreen; 