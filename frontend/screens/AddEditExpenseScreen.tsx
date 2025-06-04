import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Image, Alert, View as RNView, Platform } from 'react-native';
import { View, Text } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as expenseService from '../services/expenseService';
import { processReceiptWithOCR } from '../services/receiptService';
import { useExpenseData } from '../context/ExpenseDataContext';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';
import CategoryIcon from '../components/design-system/CategoryIcon';

// Define the navigation stack type
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: { expenseId: string };
  ExpensesList: undefined;
  AddEditExpense: { expenseId?: string } | undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddEditExpense'>;

// Interface for route params
interface RouteParams {
  expenseId?: string;
  receiptData?: {
    _id?: string;
    image: string;
    date: string;
    amount: number;
    description: string;
  };
  isFromUpload?: boolean;
}

// Interface for form validation
interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
}

// AddEditExpenseScreen: Redesigned with Apple-inspired design and better UX
// Features: Clean form layout, category picker with icons, proper validation, haptic feedback
const AddEditExpenseScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  
  // Get expense data context for updating
  const { addExpense, updateExpense, expenses } = useExpenseData();
  
  // Get route parameters
  const params = route.params as RouteParams;
  const expenseId = params?.expenseId;
  const receiptData = params?.receiptData;
  const isFromUpload = params?.isFromUpload || false;
  const isEditing = !!expenseId;

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasShownToast, setHasShownToast] = useState(false);

  // Common categories with better organization
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

  // Load existing expense data if editing
  useEffect(() => {
    if (isEditing && expenseId) {
      const existingExpense = expenses.find(exp => exp._id === expenseId);
      if (existingExpense) {
        setAmount(existingExpense.amount.toString());
        setDescription(existingExpense.description);
        setDate(new Date(existingExpense.date));
        setCategory(existingExpense.category || '');
        setVendor(existingExpense.vendor || '');
      }
    }
  }, [isEditing, expenseId, expenses]);

  // Initialize form with receipt data and start automatic OCR
  useEffect(() => {
    if (receiptData && !isEditing) {
      setAmount(receiptData.amount.toString());
      setDescription(receiptData.description);
      setDate(new Date(receiptData.date));
      
      // Start automatic OCR processing for new receipts
      if (isFromUpload && receiptData._id && !hasShownToast) {
        startAutomaticOCR(receiptData._id);
        setHasShownToast(true);
      }
    }
  }, [receiptData, isFromUpload, hasShownToast, isEditing]);

  // Automatic OCR processing function
  const startAutomaticOCR = async (receiptId: string) => {
    setIsProcessingOCR(true);
    hapticFeedback.buttonPress();
    
    try {
      toast.success('Processing Receipt', 'AI is extracting data from your receipt...');

      const result = await processReceiptWithOCR(receiptId);
      const extractedData = result.extractedData;
      
      // Auto-fill form with extracted data
      if (extractedData.amount && extractedData.amount > 0) {
        setAmount(extractedData.amount.toString());
      }
      
      if (extractedData.vendor) {
        setDescription(extractedData.vendor);
        setVendor(extractedData.vendor);
      }
      
      if (extractedData.date) {
        setDate(new Date(extractedData.date));
      }
      
      if (extractedData.category) {
        setCategory(extractedData.category);
      }
      
      setOcrCompleted(true);
      hapticFeedback.success();
      toast.success('Data Extracted!', 'Form has been pre-filled. Review and adjust as needed.');

    } catch (error) {
      console.error('OCR failed:', error);
      hapticFeedback.error();
      toast.error('Auto-extraction Failed', 'Please fill the form manually.');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      hapticFeedback.error();
      return;
    }

    setIsSaving(true);
    hapticFeedback.buttonPress();
    
    try {
      const expenseData: expenseService.ExpenseData = {
        amount: parseFloat(amount),
        description: description.trim(),
        date: date.toISOString(),
        category: category.trim() || undefined,
        vendor: vendor.trim() || undefined,
        receiptImage: receiptData?.image || undefined,
      };

      if (isEditing && expenseId) {
        // Update existing expense
        const updatedExpense = await expenseService.updateExpense(expenseId, expenseData);
        updateExpense(updatedExpense);
        hapticFeedback.success();
        toast.success('Expense Updated', 'Your expense has been updated successfully.');
        navigation.goBack();
      } else {
        // Create new expense
        const savedExpense = await expenseService.saveExpense(expenseData);
        addExpense(savedExpense);
        hapticFeedback.success();
        toast.success('Expense Saved', 'Your expense has been recorded successfully.');
        navigation.goBack();
      }
      
    } catch (error: any) {
      console.error('Save error:', error);
      hapticFeedback.error();
      toast.error('Save Failed', error.message || 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle date change with proper DateTimePicker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      hapticFeedback.buttonPress();
    }
  };

  const handleDatePress = () => {
    hapticFeedback.buttonPress();
    setShowDatePicker(true);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Reusable form input component
  const FormInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    required = false,
    error,
    multiline = false
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: any;
    required?: boolean;
    error?: string;
    multiline?: boolean;
  }) => (
    <View
      backgroundColor="white"
      borderRadius={12}
      padding={16}
      marginBottom={16}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: error ? 1 : 0,
        borderColor: error ? '#DC2626' : 'transparent',
      }}
    >
      <Text fontSize={15} fontWeight="600" color="#000000" marginBottom={8}>
        {label} {required && <Text color="#DC2626">*</Text>}
      </Text>
      <TextInput
        style={{
          fontSize: 17,
          color: '#000000',
          paddingVertical: 4,
          minHeight: multiline ? 80 : 24,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {error && (
        <Text fontSize={13} color="#DC2626" marginTop={4}>
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        {/* Back Button and Save Button Row */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: isSaving ? 0.7 : 1,
            }}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <Ionicons name="sync" size={16} color="white" />
            ) : (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
            <Text color="white" fontWeight="600">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </RNView>

        {/* Title and Status */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <RNView style={{ flex: 1 }}>
            <Text fontSize={34} fontWeight="bold" color="#000000" marginBottom={4}>
              {isEditing ? 'Edit Expense' : 'Add Expense'}
            </Text>
            <Text fontSize={17} color="#8E8E93" fontWeight="400">
              {receiptData ? 'From receipt scan' : 'Manual entry'}
            </Text>
          </RNView>
          
          {/* Status Indicators */}
          {receiptData && (
            <RNView style={{ alignItems: 'flex-end', gap: 4 }}>
              <RNView style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 6,
                backgroundColor: '#D1FAE5',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}>
                <Ionicons name="camera" size={12} color="#059669" />
                <Text fontSize={12} color="#059669" fontWeight="500">Receipt</Text>
              </RNView>
              
              {isProcessingOCR && (
                <RNView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 6,
                  backgroundColor: '#DBEAFE',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}>
                  <Ionicons name="sync" size={12} color="#2563EB" />
                  <Text fontSize={12} color="#2563EB" fontWeight="500">Processing...</Text>
                </RNView>
              )}
              
              {ocrCompleted && (
                <RNView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 6,
                  backgroundColor: '#D1FAE5',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text fontSize={12} color="#059669" fontWeight="500">Auto-filled</Text>
                </RNView>
              )}
            </RNView>
          )}
        </RNView>
      </View>

      {/* Form Content */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Preview */}
        {receiptData?.image && (
          <View
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            marginBottom={20}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text fontSize={17} fontWeight="600" color="#000000" marginBottom={12}>
              Receipt Image
            </Text>
            <Image
              source={{ uri: receiptData.image }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Amount Input */}
        <FormInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          required={true}
          error={errors.amount}
        />

        {/* Description Input */}
        <FormInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What was this expense for?"
          required={true}
          error={errors.description}
          multiline={true}
        />

        {/* Date Picker */}
        <View
          backgroundColor="white"
          borderRadius={12}
          padding={16}
          marginBottom={16}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <Text fontSize={15} fontWeight="600" color="#000000" marginBottom={8}>
            Date
          </Text>
          <TouchableOpacity
            onPress={handleDatePress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 4,
            }}
            activeOpacity={0.7}
          >
            <Text fontSize={17} color="#000000">
              {formatDate(date)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Category Selection */}
        <View
          backgroundColor="white"
          borderRadius={12}
          padding={16}
          marginBottom={16}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <Text fontSize={15} fontWeight="600" color="#000000" marginBottom={12}>
            Category
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  hapticFeedback.buttonPress();
                }}
                style={{
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: category === cat ? '#007AFF' : '#F2F2F7',
                  minWidth: 80,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: category === cat ? 'rgba(255,255,255,0.2)' : undefined,
                    borderRadius: 16,
                  }}
                >
                  <CategoryIcon 
                    category={cat} 
                    size={32} 
                    iconSize={16}
                  />
                </View>
                <Text 
                  fontSize={12} 
                  fontWeight="500" 
                  color={category === cat ? 'white' : '#000000'}
                  textAlign="center"
                  numberOfLines={2}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Vendor Input */}
        <FormInput
          label="Vendor"
          value={vendor}
          onChangeText={setVendor}
          placeholder="Where did you make this purchase?"
        />

        {/* OCR Processing Overlay */}
        {isProcessingOCR && (
          <View
            position="absolute"
            top={0}
            left={20}
            right={20}
            bottom={0}
            backgroundColor="rgba(255, 255, 255, 0.95)"
            borderRadius={12}
            justifyContent="center"
            alignItems="center"
            style={{ zIndex: 10 }}
          >
            <View
              backgroundColor="#EBF8FF"
              padding={24}
              borderRadius={16}
              borderWidth={1}
              borderColor="#BEE3F8"
              alignItems="center"
              gap={12}
            >
              <Text fontSize={32}>🤖</Text>
              <Text fontSize={20} fontWeight="bold" color="#1E40AF">
                Extracting Data
              </Text>
              <Text fontSize={15} color="#2563EB" textAlign="center">
                AI is reading your receipt and filling the form automatically...
              </Text>
              <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Text color="#2563EB">⏳</Text>
                <Text fontSize={13} color="#2563EB">
                  This takes just a few seconds
                </Text>
              </RNView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

export default AddEditExpenseScreen; 