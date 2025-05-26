import React, { useState } from 'react';
import { Box, Text, VStack, HStack, Button, useColorModeValue, ScrollView, Center, Icon, Pressable, useToast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import * as receiptService from '../services/receiptService';

// Mock inbox data: pending receipts to review
const inboxItems = [
  { id: 1, date: '2024-06-10', amount: 23.45 },
  { id: 2, date: '2024-06-09', amount: 54.99 },
  { id: 3, date: '2024-06-08', amount: 12.00 },
];

// InboxScreen: Shows pending receipts or uncategorized expenses
const InboxScreen: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');
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

  // If inbox is empty, show a friendly message
  if (inboxItems.length === 0) {
    return (
      <Center flex={1} bg={useColorModeValue('gray.50', 'gray.900')} px={4}>
        <Icon as={Ionicons} name="mail-open-outline" size="2xl" color="gray.400" mb={4} />
        <Text fontSize="xl" fontWeight="bold" color={heading} mb={2}>Inbox is empty</Text>
        <Text color={text} textAlign="center" mb={4}>You're all caught up! New receipts and notifications will appear here.</Text>
      </Center>
    );
  }

  // Otherwise, show the list of inbox items
  return (
    <ScrollView flex={1} bg={useColorModeValue('gray.50', 'gray.900')} p={4} pt={8}>
      <VStack space={4}>
        {/* Upload Receipt Button */}
        <Box p={4} borderWidth={1} borderRadius={20} mb={2} bg={cardBg} borderColor={border} shadow={2}>
          <Text fontSize="lg" fontWeight="bold" mb={3} color={heading}>Add New Receipt</Text>
          <Button
            colorScheme="blue"
            borderRadius={20}
            leftIcon={<Ionicons name={isUploading ? "hourglass" : "cloud-upload"} size={22} color="white" />}
            _text={{ fontWeight: 'bold', fontSize: 'md' }}
            onPress={pickImage}
            isLoading={isUploading}
            isDisabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Receipt'}
          </Button>
        </Box>
        {inboxItems.map(item => (
          <Box key={item.id} p={4} borderWidth={1} borderRadius={20} mb={2} bg={cardBg} borderColor={border} shadow={2}>
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" space={3}>
                {/* Receipt icon */}
                <Icon as={Ionicons} name="receipt-outline" size="lg" color="blue.400" />
                <VStack>
                  <Text color={heading} fontWeight="semibold">Receipt</Text>
                  <Text color={text} fontSize="xs">{item.date}</Text>
                </VStack>
              </HStack>
              <Text color={heading} fontWeight="bold" fontSize="lg">${item.amount.toFixed(2)}</Text>
              <Button colorScheme="teal" borderRadius={16} size="sm">Review</Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </ScrollView>
  );
};

export default InboxScreen; 