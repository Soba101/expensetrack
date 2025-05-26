import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  useColorModeValue, 
  ScrollView, 
  useToast,
  Image,
  Center,
  Icon
} from 'native-base';
import { TextInput, StyleSheet, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as expenseService from '../services/expenseService';

const { width } = Dimensions.get('window');

// Styles for TextInput components
const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
});

// Interface for route params
interface RouteParams {
  receiptData?: {
    _id?: string; // Optional since it might not be saved yet
    image: string;
    date: string;
    amount: number;
    description: string;
  };
  isFromUpload?: boolean;
}

// AddEditExpenseScreen: Form to add or edit an expense, including receipt upload.
const AddEditExpenseScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const toast = useToast();
  
  // Get route parameters - use stable references
  const params = route.params as RouteParams;
  const receiptDataId = params?.receiptData?._id || 'temp-receipt'; // Use temp ID for unsaved receipts
  const receiptData = params?.receiptData;
  const isFromUpload = params?.isFromUpload || false;

  // Theme colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // Prevent multiple toast shows

  // Helper function to format date as YYYY-MM-DD for consistent parsing
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If invalid date, return today's date
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Initialize form with receipt data if available - use stable ID to prevent infinite loops
  useEffect(() => {
    if (receiptData && receiptDataId) {
      setAmount(receiptData.amount.toString());
      setDescription(receiptData.description);
      setDate(formatDateForInput(receiptData.date));
      
      // Show success message for uploaded receipt (only once)
      if (isFromUpload && !hasShownToast) {
        toast.show({
          title: 'Receipt Processed!',
          description: 'Please review and edit the details below, then save your expense.',
          duration: 4000,
        });
        setHasShownToast(true);
      }
    }
  }, [receiptDataId, isFromUpload, hasShownToast]); // Use stable ID instead of object

  // Set default date separately to avoid conflicts
  useEffect(() => {
    if (!receiptDataId && !date) {
      setDate(formatDateForInput(new Date().toISOString()));
    }
  }, [receiptDataId, date]);

  // Handle form submission - now actually saves to backend
  const handleSave = async () => {
    // Validate required fields
    if (!amount || !description) {
      toast.show({
        title: 'Missing Information',
        description: 'Please fill in amount and description.',
        duration: 3000,
      });
      return;
    }

    // Validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      toast.show({
        title: 'Invalid Date',
        description: 'Please enter a valid date in YYYY-MM-DD format.',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Prepare expense data
      const expenseData: expenseService.ExpenseData = {
        amount: parseFloat(amount),
        description: description.trim(),
        date: parsedDate.toISOString(), // Use the validated parsed date
        category: category.trim() || undefined,
        vendor: vendor.trim() || undefined,
        receiptImage: receiptData?.image || undefined, // Include receipt image if available
      };

      // Save expense (and receipt if present) to backend
      const result = await expenseService.saveExpense(expenseData);
      
      console.log('Expense saved successfully:', result);
      
      toast.show({
        title: 'Expense Saved!',
        description: receiptData 
          ? 'Your expense and receipt have been successfully recorded.'
          : 'Your expense has been successfully recorded.',
        duration: 3000,
      });

      // Navigate back to dashboard
      navigation.goBack();
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.show({
        title: 'Save Failed',
        description: error.message || 'Failed to save expense. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView flex={1} bg={bg} p={4} pt={8}>
      <VStack space={6}>
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={heading} mb={2}>
            {receiptData ? 'Review Receipt' : 'Add Expense'}
          </Text>
          {isFromUpload && (
            <Text fontSize="md" color={text}>
              Receipt uploaded successfully! Please review and edit the details below.
            </Text>
          )}
        </Box>

        {/* Receipt Image Preview (if available) */}
        {receiptData?.image && (
          <Box p={4} borderWidth={1} borderRadius={20} bg={cardBg} borderColor={border} shadow={2}>
            <Text fontSize="lg" fontWeight="bold" mb={3} color={heading}>Receipt Image</Text>
            <Center>
              <Image
                source={{ uri: receiptData.image }}
                alt="Receipt"
                width="100%"
                height={200}
                borderRadius={10}
                resizeMode="contain"
              />
            </Center>
          </Box>
        )}

        {/* Expense Form */}
        <Box p={4} borderWidth={1} borderRadius={20} bg={cardBg} borderColor={border} shadow={2}>
          <Text fontSize="lg" fontWeight="bold" mb={4} color={heading}>Expense Details</Text>
          
          <VStack space={4}>
            {/* Amount Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={text} mb={2}>
                Amount *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: border,
                    backgroundColor: cardBg,
                    color: text,
                  }
                ]}
                placeholder="0.00"
                placeholderTextColor="gray"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </Box>

            {/* Description Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={text} mb={2}>
                Description *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: border,
                    backgroundColor: cardBg,
                    color: text,
                  }
                ]}
                placeholder="What was this expense for?"
                placeholderTextColor="gray"
                value={description}
                onChangeText={setDescription}
              />
            </Box>

            {/* Date Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={text} mb={2}>
                Date
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: border,
                    backgroundColor: cardBg,
                    color: text,
                  }
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="gray"
                value={date}
                onChangeText={setDate}
              />
            </Box>

            {/* Vendor Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={text} mb={2}>
                Vendor/Store
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: border,
                    backgroundColor: cardBg,
                    color: text,
                  }
                ]}
                placeholder="Where did you make this purchase?"
                placeholderTextColor="gray"
                value={vendor}
                onChangeText={setVendor}
              />
            </Box>

            {/* Category Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={text} mb={2}>
                Category
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: border,
                    backgroundColor: cardBg,
                    color: text,
                  }
                ]}
                placeholder="e.g., Food, Travel, Office Supplies"
                placeholderTextColor="gray"
                value={category}
                onChangeText={setCategory}
              />
            </Box>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <HStack space={4}>
          <Button
            flex={1}
            variant="outline"
            borderRadius={20}
            onPress={() => navigation.goBack()}
            _text={{ fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button
            flex={1}
            colorScheme="green"
            borderRadius={20}
            onPress={handleSave}
            isLoading={isSaving}
            isDisabled={isSaving}
            _text={{ fontWeight: 'bold' }}
            leftIcon={<Ionicons name="checkmark-circle" size={20} color="white" />}
          >
            {isSaving ? 'Saving...' : 'Save Expense'}
          </Button>
        </HStack>

        {/* Receipt Info (if from upload) */}
        {receiptData && (
          <Box p={4} borderWidth={1} borderRadius={20} bg="blue.50" borderColor="blue.200">
            <HStack alignItems="center" space={2} mb={2}>
              <Icon as={Ionicons} name="information-circle" size="sm" color="blue.500" />
              <Text fontSize="sm" fontWeight="bold" color="blue.700">
                Receipt Information
              </Text>
            </HStack>
            {receiptData._id ? (
              <Text fontSize="xs" color="blue.600">
                Receipt ID: {receiptData._id}
              </Text>
            ) : (
              <Text fontSize="xs" color="blue.600">
                Receipt will be saved when you save this expense
              </Text>
            )}
            <Text fontSize="xs" color="blue.600">
              Processed: {new Date(receiptData.date).toLocaleString()}
            </Text>
          </Box>
        )}
      </VStack>
    </ScrollView>
  );
};

export default AddEditExpenseScreen; 