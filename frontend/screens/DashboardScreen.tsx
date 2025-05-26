import React, { useState } from 'react';
import { ScrollView, useColorModeValue, Button, HStack, Box, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ExpenseSummary from '../components/ExpenseSummary';
import RecentTransactions from '../components/RecentTransactions';

import QuickActions from '../components/QuickActions';
import UserInfo from '../components/UserInfo';
import SmartInsights from '../components/SmartInsights';
import * as ImagePicker from 'expo-image-picker';
import * as receiptService from '../services/receiptService';

// DashboardScreen: Shows an overview of expenses and quick stats using modular components
const DashboardScreen: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const navigation = useNavigation();
  const toast = useToast();
  
  // State for upload loading
  const [isUploading, setIsUploading] = useState(false);

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

  // Function to handle image processing (without saving to database yet)
  const handleImageUpload = async (imageUri: string) => {
    setIsUploading(true);
    
    try {
      // Show loading toast
      toast.show({
        title: 'Processing Receipt',
        description: 'Converting your receipt image...',
        duration: 2000,
      });

      // Process the image (convert to base64 and prepare data) - LOCAL ONLY
      const processedData = await receiptService.processReceiptImage(imageUri);
      
      // Prepare receipt data for the form (NOT saved to DB yet)
      const receiptData = {
        image: processedData.image,
        date: processedData.extractedData.date,
        amount: processedData.extractedData.amount,
        description: processedData.extractedData.description,
      };

      console.log('Image processed successfully');

      // Show success message
      toast.show({
        title: 'Receipt Processed!',
        description: 'Please review and edit the details, then save your expense.',
        duration: 3000,
      });

      // Navigate to AddEditExpenseScreen with the processed receipt data (not saved yet)
      (navigation as any).navigate('AddEditExpense', { 
        receiptData: receiptData,
        isFromUpload: true 
      });

    } catch (error: any) {
      console.error('Processing error:', error);
      toast.show({
        title: 'Processing Failed',
        description: error.message || 'Failed to process receipt. Please try again.',
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