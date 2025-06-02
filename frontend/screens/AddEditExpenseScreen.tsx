import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, useTheme } from '@tamagui/core';
import { TextInput, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image, View as RNView } from 'react-native';
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
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
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
  
  // Get route parameters
  const params = route.params as RouteParams;
  const receiptDataId = params?.receiptData?._id || 'temp-receipt';
  const receiptData = params?.receiptData;
  const isFromUpload = params?.isFromUpload || false;

  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const heading = theme.color.val;
  const text = theme.color.val;
  const subtext = theme.colorHover.val;
  const inputBg = theme.backgroundHover.val;

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
      
      // Show processing message
      console.log('🤖 Processing Receipt: Extracting data automatically...');

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
      console.log('✨ Data Extracted! Form has been pre-filled. Review and adjust as needed.');

    } catch (error) {
      console.error('❌ Automatic OCR failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';
      
      // Show error message but don't block user
      console.log('⚠️ Auto-extraction Failed: Please fill the form manually.');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    // Simple validation
    if (!amount || !description) {
      console.log('Missing Information: Please fill in amount and description.');
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
      
      console.log('Expense Saved: Your expense has been recorded successfully.');

      navigation.goBack();
      
    } catch (error: any) {
      console.error('Save error:', error);
      console.log('Save Failed:', error.message || 'Please try again.');
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
    <RNView style={{ gap: 8, marginBottom: 20 }}>
      <Text fontSize="$3" fontWeight="600" color={text}>
        {label} {required && <Text color="#EF4444">*</Text>}
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
    </RNView>
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
          <View 
            padding="$4" 
            borderRadius="$4" 
            backgroundColor={cardBg} 
            marginBottom="$6"
          >
            <Text fontSize="$4" fontWeight="600" color={text} marginBottom="$3">
              Receipt Image
            </Text>
            <RNView style={{ alignItems: 'center' }}>
              <Image
                source={{ uri: receiptData.image }}
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
            </RNView>
          </View>
        ) : null;

      case 'form':
        return (
          <RNView style={{ position: 'relative' }}>
            <RNView>
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

              {/* Category Dropdown - Simplified for now */}
              <RNView style={{ gap: 8, marginBottom: 20 }}>
                <Text fontSize="$3" fontWeight="600" color={text}>
                  Category
                </Text>
                <RNView style={{ gap: 8 }}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: category === cat ? '#3B82F6' : border,
                        backgroundColor: category === cat ? '#EBF8FF' : inputBg,
                      }}
                    >
                      <Text 
                        fontSize="$3" 
                        color={category === cat ? '#1D4ED8' : text}
                        fontWeight={category === cat ? '600' : '400'}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </RNView>
              </RNView>
            </RNView>

            {/* OCR Processing Overlay */}
            {isProcessingOCR && (
              <RNView
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <RNView style={{ gap: 16, alignItems: 'center' }}>
                  <View
                    backgroundColor="#EBF8FF"
                    padding="$6"
                    borderRadius="$6"
                    borderWidth={1}
                    borderColor="#BEE3F8"
                  >
                    <RNView style={{ gap: 12, alignItems: 'center' }}>
                      <Text fontSize="$8">🤖</Text>
                      <Text fontSize="$5" fontWeight="bold" color="#1E40AF">
                        Extracting Data
                      </Text>
                      <Text fontSize="$3" color="#2563EB" textAlign="center">
                        AI is reading your receipt and filling the form automatically...
                      </Text>
                      <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <Text color="#2563EB">⏳</Text>
                        <Text fontSize="$3" color="#2563EB">
                          This takes just a few seconds
                        </Text>
                      </RNView>
                    </RNView>
                  </View>
                </RNView>
              </RNView>
            )}
          </RNView>
        );

      case 'buttons':
        return (
          <RNView style={{ gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#3B82F6',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Text fontSize="$4" fontWeight="600" color="white">
                {isSaving ? 'Saving...' : 'Save Expense'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                borderWidth: 1,
                borderColor: border,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text fontSize="$4" fontWeight="500" color={text}>
                Cancel
              </Text>
            </TouchableOpacity>
          </RNView>
        );

      case 'info':
        return receiptData ? (
          <View 
            padding="$4" 
            borderRadius="$3" 
            backgroundColor={cardBg}
            marginTop="$6"
          >
            <Text fontSize="$3" fontWeight="600" color={text} marginBottom="$1">
              Receipt Information
            </Text>
            <Text fontSize="$2" color={subtext}>
              {receiptData._id 
                ? `ID: ${receiptData._id}`
                : 'Will be saved with this expense'
              }
            </Text>
          </View>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <RNView style={[styles.container, { backgroundColor: bg }]}>
      {/* Simple Header */}
      <View 
        paddingTop="$10" 
        paddingBottom="$2" 
        paddingHorizontal="$6"
        borderBottomWidth={1}
        borderBottomColor={border}
      >
        <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="arrow-back" size={20} color={text} />
              <Text fontSize="$4" color={text}>Back</Text>
            </RNView>
          </TouchableOpacity>
          
          {receiptData && (
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="camera" size={16} color="#10B981" />
              <Text fontSize="$3" color="#10B981" fontWeight="500">Receipt</Text>
              
              {/* OCR Processing Indicator */}
              {isProcessingOCR && (
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="sync" size={12} color="#3B82F6" />
                  <Text fontSize="$2" color="#3B82F6" fontWeight="500">Processing...</Text>
                </RNView>
              )}
              
              {/* OCR Completed Indicator */}
              {ocrCompleted && (
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text fontSize="$2" color="#10B981" fontWeight="500">Auto-filled</Text>
                </RNView>
              )}
            </RNView>
          )}
        </RNView>
        
        <Text fontSize="$8" fontWeight="700" color={heading}>
          {receiptData ? 'Review Receipt' : 'Add Expense'}
        </Text>
      </View>

      {/* FlatList for form content */}
      <FlatList
        data={formData}
        renderItem={renderFormSection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </RNView>
  );
};

export default AddEditExpenseScreen; 