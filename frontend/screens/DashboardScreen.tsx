import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { View, useTheme, Text } from '@tamagui/core';
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

// Custom toast hook for Tamagui (temporary implementation)
const useToast = () => {
  return {
    show: ({ title, description, duration }: { title: string; description: string; duration: number }) => {
      // For now, we'll use console.log - we'll implement proper toast later
      console.log(`Toast: ${title} - ${description}`);
    }
  };
};

// DashboardScreen: Shows an overview of expenses and quick stats using modular components
const DashboardScreen: React.FC = () => {
  // Using Tamagui theme instead of useColorModeValue
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const heading = theme.color.val;
  
  const navigation = useNavigation();
  const toast = useToast();
  
  // Get refresh function from expense data context
  const { refreshData, loading, error, refreshing } = useExpenseData();
  
  // State for upload loading
  const [isUploading, setIsUploading] = useState(false);

  // Refresh data when screen comes into focus (e.g., returning from expense creation)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Dashboard focused - refreshing data...');
      refreshData();
    }, []) // Empty dependency array to prevent infinite loop
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
    // Using React Native ScrollView with Tamagui styling and pull-to-refresh
    <ScrollView 
      style={{ 
        flex: 1, 
        backgroundColor: bg, 
        padding: 16, 
        paddingTop: 64 
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          tintColor={theme.color.val}
          title="Pull to refresh"
          titleColor={theme.color.val}
        />
      }
    >
      {/* Show error state if data failed to load */}
      {error && (
        <View 
          padding="$4" 
          borderRadius="$5" 
          backgroundColor="#FEF2F2" 
          borderWidth={1}
          borderColor="#FECACA"
          marginBottom="$4"
        >
          <Text color="#DC2626" fontWeight="600" marginBottom="$2">
            ⚠️ Data Loading Error
          </Text>
          <Text color="#DC2626" fontSize="$3">
            {error}
          </Text>
        </View>
      )}

      <View gap="$4">
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
      </View>
    </ScrollView>
  );
};

export default DashboardScreen; 