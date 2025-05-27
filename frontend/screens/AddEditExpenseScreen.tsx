import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  useColorModeValue, 
  useToast,
  Image,
  Center,
  Icon,
  Pressable,
  Select,
  CheckIcon,
  Spinner
} from 'native-base';
import { TextInput, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as expenseService from '../services/expenseService';
import { processReceiptWithOCR, OCRExtractedData } from '../services/receiptService';

const { width } = Dimensions.get('window');

// Clean, minimal styles for form inputs
const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
    fontWeight: '400',
  },
});

// Interface for route params
interface RouteParams {
  receiptData?: {
    _id?: string;
    image: string;
    date: string;
    amount: number;
    description: string;
  };
  isFromUpload?: boolean;
}

// Clean and minimal AddEditExpenseScreen
const AddEditExpenseScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const toast = useToast();
  
  // Get route parameters
  const params = route.params as RouteParams;
  const receiptDataId = params?.receiptData?._id || 'temp-receipt';
  const receiptData = params?.receiptData;
  const isFromUpload = params?.isFromUpload || false;

  // Clean theme colors
  const bg = useColorModeValue('white', 'gray.900');
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const border = useColorModeValue('gray.300', 'gray.600');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.700', 'gray.200');
  const subtext = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  
  // OCR state
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);

  // Common categories for dropdown
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Business',
    'Personal Care',
    'Other'
  ];

  // Helper function to format date
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Initialize form with receipt data and start automatic OCR
  useEffect(() => {
    if (receiptData && receiptDataId) {
      setAmount(receiptData.amount.toString());
      setDescription(receiptData.description);
      setDate(formatDateForInput(receiptData.date));
      
      // Start automatic OCR processing for new receipts
      if (isFromUpload && receiptData._id && !hasShownToast) {
        console.log('🤖 Starting automatic OCR processing for receipt:', receiptData._id);
        startAutomaticOCR(receiptData._id);
        setHasShownToast(true);
      }
    }
  }, [receiptDataId, isFromUpload, hasShownToast]);

  // Set default date
  useEffect(() => {
    if (!receiptDataId && !date) {
      setDate(formatDateForInput(new Date().toISOString()));
    }
  }, [receiptDataId, date]);

  // Automatic OCR processing function
  const startAutomaticOCR = async (receiptId: string) => {
    setIsProcessingOCR(true);
    
    try {
      console.log('🤖 Starting automatic OCR processing...');
      
      // Show processing toast
      toast.show({
        title: '🤖 Processing Receipt',
        description: 'Extracting data automatically...',
        duration: 2000,
      });

      // Process receipt with OCR
      const result = await processReceiptWithOCR(receiptId);
      const extractedData = result.extractedData;
      
      console.log('✅ OCR processing complete:', extractedData);
      
      // Auto-fill form with extracted data
      if (extractedData.amount && extractedData.amount > 0) {
        setAmount(extractedData.amount.toString());
      }
      
      if (extractedData.vendor) {
        setDescription(extractedData.vendor);
        setVendor(extractedData.vendor);
      }
      
      if (extractedData.date) {
        setDate(formatDateForInput(extractedData.date));
      }
      
      if (extractedData.category) {
        setCategory(extractedData.category);
      }
      
      // Mark as completed
      setOcrCompleted(true);
      
      // Show success message
      toast.show({
        title: '✨ Data Extracted!',
        description: 'Form has been pre-filled. Review and adjust as needed.',
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ Automatic OCR failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';
      
      // Show error toast but don't block user
      toast.show({
        title: '⚠️ Auto-extraction Failed',
        description: 'Please fill the form manually.',
        duration: 4000,
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    // Simple validation
    if (!amount || !description) {
      toast.show({
        title: 'Missing Information',
        description: 'Please fill in amount and description.',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const expenseData: expenseService.ExpenseData = {
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date(date).toISOString(),
        category: category.trim() || undefined,
        vendor: vendor.trim() || undefined,
        receiptImage: receiptData?.image || undefined,
      };

      await expenseService.saveExpense(expenseData);
      
      toast.show({
        title: 'Expense Saved',
        description: 'Your expense has been recorded successfully.',
        duration: 2000,
      });

      navigation.goBack();
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.show({
        title: 'Save Failed',
        description: error.message || 'Please try again.',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Clean input component
  const FormInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    required = false
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: any;
    required?: boolean;
  }) => (
    <VStack space={2} mb={5}>
      <Text fontSize="sm" fontWeight="600" color={text}>
        {label} {required && <Text color="red.500">*</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            borderColor: border,
            backgroundColor: inputBg,
            color: text,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={subtext}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </VStack>
  );

  // Create form data for FlatList
  const formData = [
    { id: 'receipt', type: 'receipt' },
    { id: 'form', type: 'form' },
    { id: 'buttons', type: 'buttons' },
    { id: 'info', type: 'info' },
  ];

  // Render each section
  const renderFormSection = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'receipt':
        return receiptData?.image ? (
          <Box 
            p={4} 
            borderRadius={16} 
            bg={cardBg} 
            mb={6}
          >
            <Text fontSize="md" fontWeight="600" color={text} mb={3}>
              Receipt Image
            </Text>
            <Center>
              <Image
                source={{ uri: receiptData.image }}
                alt="Receipt"
                width="100%"
                height={160}
                borderRadius={12}
                resizeMode="cover"
              />
            </Center>
          </Box>
        ) : null;

      case 'form':
        return (
          <Box position="relative">
            <VStack space={0}>
              <FormInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                required={true}
              />

              <FormInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="What was this expense for?"
                required={true}
              />

              <FormInput
                label="Date"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />

              <FormInput
                label="Vendor"
                value={vendor}
                onChangeText={setVendor}
                placeholder="Where did you make this purchase?"
              />

              {/* Category Dropdown */}
              <VStack space={2} mb={5}>
                <Text fontSize="sm" fontWeight="600" color={text}>
                  Category
                </Text>
                <Select
                  selectedValue={category}
                  onValueChange={(value: string) => setCategory(value || '')}
                  placeholder="Select a category"
                  borderRadius={12}
                  borderColor={border}
                  bg={inputBg}
                  fontSize="md"
                  _selectedItem={{
                    bg: 'blue.100',
                    endIcon: <CheckIcon size="xs" />,
                  }}
                >
                  {categories.map(cat => (
                    <Select.Item key={cat} label={cat} value={cat} />
                  ))}
                </Select>
                </VStack>
            </VStack>

            {/* OCR Processing Overlay */}
            {isProcessingOCR && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(255, 255, 255, 0.95)"
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
                zIndex={10}
              >
                <VStack space={4} alignItems="center">
                  <Box
                    bg="blue.50"
                    p={6}
                    borderRadius={20}
                    borderWidth={1}
                    borderColor="blue.200"
                  >
                    <VStack space={3} alignItems="center">
                      <Text fontSize="3xl">🤖</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">
                        Extracting Data
                      </Text>
                      <Text fontSize="sm" color="blue.600" textAlign="center">
                        AI is reading your receipt and filling the form automatically...
                      </Text>
                      <HStack space={2} alignItems="center" mt={2}>
                        <Spinner size="sm" color="blue.500" />
                        <Text fontSize="sm" color="blue.600">
                          This takes just a few seconds
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            )}
          </Box>
        );

      case 'buttons':
        return (
          <VStack space={3} mt={6}>
            <Button
              size="lg"
              colorScheme="blue"
              borderRadius={12}
              onPress={handleSave}
              isLoading={isSaving}
              isDisabled={isSaving}
              _text={{ fontWeight: '600', fontSize: 'md' }}
            >
              {isSaving ? 'Saving...' : 'Save Expense'}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              borderRadius={12}
              onPress={() => navigation.goBack()}
              _text={{ fontWeight: '500', fontSize: 'md' }}
            >
              Cancel
            </Button>
          </VStack>
        );

      case 'info':
        return receiptData ? (
          <Box 
            p={4} 
            borderRadius={12} 
            bg={cardBg}
            mt={6}
          >
            <Text fontSize="sm" fontWeight="600" color={text} mb={1}>
              Receipt Information
            </Text>
            <Text fontSize="xs" color={subtext}>
              {receiptData._id 
                ? `ID: ${receiptData._id}`
                : 'Will be saved with this expense'
              }
            </Text>
          </Box>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Box flex={1} bg={bg} pt={8}>
      {/* Simple Header */}
      <Box 
        pt={10} 
        pb={2} 
        px={6}
        borderBottomWidth={1}
        borderBottomColor={border}
      >
        <HStack alignItems="center" justifyContent="space-between" mb={4}>
          <Pressable onPress={() => navigation.goBack()}>
            <HStack alignItems="center" space={2}>
              <Icon as={Ionicons} name="arrow-back" size="md" color={text} />
              <Text fontSize="md" color={text}>Back</Text>
            </HStack>
          </Pressable>
          
          {receiptData && (
            <HStack alignItems="center" space={2}>
              <Icon as={Ionicons} name="camera" size="sm" color="green.500" />
              <Text fontSize="sm" color="green.500" fontWeight="500">Receipt</Text>
              
              {/* OCR Processing Indicator */}
              {isProcessingOCR && (
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="sync" size="xs" color="blue.500" />
                  <Text fontSize="xs" color="blue.500" fontWeight="500">Processing...</Text>
                </HStack>
              )}
              
              {/* OCR Completed Indicator */}
              {ocrCompleted && (
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="checkmark-circle" size="sm" color="green.500" />
                  <Text fontSize="xs" color="green.500" fontWeight="500">Auto-filled</Text>
                </HStack>
              )}
            </HStack>
          )}
        </HStack>
        
        <Text fontSize="2xl" fontWeight="700" color={heading}>
          {receiptData ? 'Review Receipt' : 'Add Expense'}
        </Text>
      </Box>

      {/* FlatList for form content */}
      <FlatList
        data={formData}
        renderItem={renderFormSection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingVertical: 24,
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

export default AddEditExpenseScreen; 