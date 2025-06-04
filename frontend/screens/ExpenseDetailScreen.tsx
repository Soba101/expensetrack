import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Image, Dimensions } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as expenseService from '../services/expenseService';
import * as receiptService from '../services/receiptService';
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

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseDetail'>;

// Interface for expense data from backend
interface Expense {
  _id: string;
  user: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  vendor?: string;
  receiptId?: string | { _id: string; [key: string]: any }; // Can be string ID or populated object
  createdAt: string;
  updatedAt: string;
}

// Interface for receipt data
interface Receipt {
  _id: string;
  user: string;
  image: string;
  date: string;
  amount: number;
  description: string;
  vendor?: string;
  processed?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get screen dimensions for modal sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ExpenseDetailScreen: Shows comprehensive details for a single expense
// Features: View all expense details, edit/delete actions, receipt viewing
const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExpenseDetailRouteProp>();
  const theme = useTheme();
  const toast = useToast();

  // Get expense ID from navigation params
  const { expenseId } = route.params;

  // State management
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Receipt viewing state
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  // Load expense data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenseData();
    }, [expenseId])
  );

  // Function to load expense data from backend
  const loadExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading expense data for ID:', expenseId);
      const expenseData = await expenseService.getExpenseById(expenseId);
      
      console.log('Expense data loaded:', expenseData);
      console.log('Receipt ID type:', typeof expenseData.receiptId);
      console.log('Receipt ID value:', expenseData.receiptId);
      
      setExpense(expenseData);
    } catch (err) {
      console.error('Error loading expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expense');
      
      // Show error toast
      toast.error('Load Failed', 'Unable to load expense details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to load and view receipt
  const handleViewReceipt = async () => {
    if (!expense?.receiptId) return;

    try {
      setReceiptLoading(true);
      setReceiptError(null);

      // Extract the actual receipt ID - handle both string and object cases
      let actualReceiptId: string;
      if (typeof expense.receiptId === 'string') {
        actualReceiptId = expense.receiptId;
      } else if (typeof expense.receiptId === 'object' && expense.receiptId._id) {
        // If receiptId was populated by backend, extract the _id field
        actualReceiptId = expense.receiptId._id;
      } else {
        throw new Error('Invalid receipt ID format');
      }

      console.log('Loading receipt for ID:', actualReceiptId);
      const receiptData = await receiptService.getReceiptById(actualReceiptId);
      
      setReceipt(receiptData);
      setReceiptModalVisible(true);
      hapticFeedback.success();
    } catch (err) {
      console.error('Error loading receipt:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load receipt';
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('not found')) {
          errorMessage = 'Receipt not found. It may have been deleted.';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to view this receipt.';
        } else if (err.message.includes('Server error') || err.message.includes('500')) {
          errorMessage = 'Server error. Receipt viewing is temporarily unavailable.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setReceiptError(errorMessage);
      toast.error('Receipt Load Failed', errorMessage);
      hapticFeedback.error();
    } finally {
      setReceiptLoading(false);
    }
  };

  // Function to close receipt modal
  const handleCloseReceiptModal = () => {
    hapticFeedback.buttonPress();
    setReceiptModalVisible(false);
    setReceipt(null);
    setReceiptError(null);
  };

  // Helper functions for formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Handle edit expense
  const handleEditExpense = () => {
    hapticFeedback.buttonPress();
    navigation.navigate('AddEditExpense', { expenseId: expense?._id });
  };

  // Handle delete expense with confirmation
  const handleDeleteExpense = () => {
    if (!expense) return;

    hapticFeedback.warning();
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseService.deleteExpense(expense._id);
              hapticFeedback.success();
              toast.success('Expense Deleted', 'The expense has been successfully deleted.');
              
              // Navigate back to expenses list
              navigation.goBack();
            } catch (error) {
              hapticFeedback.error();
              toast.error('Delete Failed', 'Unable to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle back navigation
  const handleGoBack = () => {
    hapticFeedback.buttonPress();
    navigation.goBack();
  };

  // Render loading state
  if (loading) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={theme.blue10?.val} />
        <Text marginTop="$4" fontSize="$4" color="$gray11">
          Loading expense details...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error || !expense) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center" padding="$6">
        <Ionicons name="alert-circle-outline" size={64} color={theme.red10?.val} />
        <Text marginTop="$4" fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
          Unable to Load Expense
        </Text>
        <Text marginTop="$2" fontSize="$4" color="$gray11" textAlign="center">
          {error || 'Expense not found'}
        </Text>
        <TouchableOpacity
          onPress={loadExpenseData}
          style={{
            marginTop: 24,
            backgroundColor: theme.blue10?.val,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text color="white" fontWeight="600">Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoBack}
          style={{
            marginTop: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text color="$blue10" fontWeight="600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header with back button and actions */}
      <View
        backgroundColor="$background"
        paddingTop="$12"
        paddingBottom="$4"
        paddingHorizontal="$4"
        borderBottomWidth={1}
        borderBottomColor="$gray6"
      >
        <View flexDirection="row" alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={handleGoBack} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={theme.gray12?.val} />
          </TouchableOpacity>
          
          <Text fontSize="$6" fontWeight="600" color="$gray12">
            Expense Details
          </Text>
          
          <View flexDirection="row" gap="$2">
            <TouchableOpacity onPress={handleEditExpense} style={{ padding: 8 }}>
              <Ionicons name="pencil" size={20} color={theme.blue10?.val} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteExpense} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={20} color={theme.red10?.val} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main expense info card */}
        <View margin="$4" backgroundColor="white" borderRadius="$4" padding="$6" shadowColor="$shadowColor" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={8}>
          {/* Amount and description */}
          <View alignItems="center" marginBottom="$6">
            <Text fontSize="$10" fontWeight="700" color="$gray12" marginBottom="$2">
              {formatCurrency(expense.amount)}
            </Text>
            <Text fontSize="$5" color="$gray11" textAlign="center">
              {expense.description}
            </Text>
          </View>

          {/* Category */}
          {expense.category && (
            <View flexDirection="row" alignItems="center" justifyContent="center" marginBottom="$4">
              <CategoryIcon category={expense.category} size={24} />
              <Text marginLeft="$3" fontSize="$4" fontWeight="500" color="$gray12">
                {expense.category}
              </Text>
            </View>
          )}

          {/* Date and time */}
          <View alignItems="center" marginBottom="$4">
            <Text fontSize="$5" fontWeight="600" color="$gray12" marginBottom="$1">
              {formatDate(expense.date)}
            </Text>
            <Text fontSize="$3" color="$gray11">
              {formatTime(expense.date)} • {getRelativeTime(expense.date)}
            </Text>
          </View>
        </View>

        {/* Details section */}
        <View margin="$4" marginTop="$2" backgroundColor="white" borderRadius="$4" padding="$4" shadowColor="$shadowColor" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={8}>
          <Text fontSize="$5" fontWeight="600" color="$gray12" marginBottom="$4">
            Details
          </Text>

          {/* Vendor */}
          {expense.vendor && (
            <View flexDirection="row" alignItems="center" paddingVertical="$3" borderBottomWidth={1} borderBottomColor="$gray6">
              <Ionicons name="storefront-outline" size={20} color={theme.gray11?.val} />
              <View marginLeft="$3" flex={1}>
                <Text fontSize="$3" color="$gray11" marginBottom="$1">Vendor</Text>
                <Text fontSize="$4" color="$gray12">{expense.vendor}</Text>
              </View>
            </View>
          )}

          {/* Receipt status */}
          {expense && (
            <View flexDirection="row" alignItems="center" paddingVertical="$3" borderBottomWidth={1} borderBottomColor="$gray6">
              <Ionicons 
                name={expense.receiptId ? "receipt" : "receipt-outline"} 
                size={20} 
                color={expense.receiptId ? theme.green10?.val : theme.gray11?.val} 
              />
              <View marginLeft="$3" flex={1}>
                <Text fontSize="$3" color="$gray11" marginBottom="$1">Receipt</Text>
                <View flexDirection="row" alignItems="center" justifyContent="space-between">
                  <View flex={1}>
                    <Text fontSize="$4" color={expense.receiptId ? "$green11" : "$gray11"}>
                      {expense.receiptId ? "Attached" : "No receipt"}
                    </Text>
                    {expense.receiptId && (
                      <Text fontSize="$2" color="$gray10" marginTop="$1">
                        ID: {(() => {
                          // Handle both string and object cases for receiptId
                          const id = typeof expense.receiptId === 'string' 
                            ? expense.receiptId 
                            : expense.receiptId._id;
                          return id.length > 8 ? id.substring(0, 8) + '...' : id;
                        })()}
                      </Text>
                    )}
                  </View>
                  {expense.receiptId && (
                    <TouchableOpacity
                      onPress={handleViewReceipt}
                      disabled={receiptLoading}
                      style={{
                        backgroundColor: theme.blue10?.val,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      {receiptLoading ? (
                        <ActivityIndicator size={14} color="white" />
                      ) : (
                        <Ionicons name="eye" size={14} color="white" />
                      )}
                      <Text marginLeft="$1" color="white" fontSize="$3" fontWeight="500">
                        {receiptLoading ? 'Loading...' : 'View'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Created date */}
          <View flexDirection="row" alignItems="center" paddingVertical="$3" borderBottomWidth={1} borderBottomColor="$gray6">
            <Ionicons name="calendar-outline" size={20} color={theme.gray11?.val} />
            <View marginLeft="$3" flex={1}>
              <Text fontSize="$3" color="$gray11" marginBottom="$1">Created</Text>
              <Text fontSize="$4" color="$gray12">
                {formatDate(expense.createdAt)}
              </Text>
            </View>
          </View>

          {/* Last updated */}
          {expense.updatedAt !== expense.createdAt && (
            <View flexDirection="row" alignItems="center" paddingVertical="$3">
              <Ionicons name="time-outline" size={20} color={theme.gray11?.val} />
              <View marginLeft="$3" flex={1}>
                <Text fontSize="$3" color="$gray11" marginBottom="$1">Last Updated</Text>
                <Text fontSize="$4" color="$gray12">
                  {formatDate(expense.updatedAt)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View margin="$4" marginTop="$2" gap="$3">
          <TouchableOpacity
            onPress={handleEditExpense}
            style={{
              backgroundColor: theme.blue10?.val,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="pencil" size={20} color="white" />
            <Text marginLeft="$2" color="white" fontSize="$4" fontWeight="600">
              Edit Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteExpense}
            style={{
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: theme.red10?.val,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trash-outline" size={20} color={theme.red10?.val} />
            <Text marginLeft="$2" color="$red10" fontSize="$4" fontWeight="600">
              Delete Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View height="$6" />
      </ScrollView>

      {/* Receipt modal */}
      <Modal
        visible={receiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseReceiptModal}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 20,
            width: screenWidth * 0.9,
            height: screenHeight * 0.8,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Text fontSize="$6" fontWeight="600" color="$gray12">Receipt</Text>
              <TouchableOpacity onPress={handleCloseReceiptModal} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color={theme.gray12?.val} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {receiptLoading ? (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.blue10?.val} />
                  <Text marginTop="$4" fontSize="$4" color="$gray11">Loading receipt...</Text>
                </View>
              ) : receiptError ? (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="alert-circle-outline" size={48} color={theme.red10?.val} />
                  <Text marginTop="$4" fontSize="$4" color="$red10" textAlign="center">{receiptError}</Text>
                  <TouchableOpacity
                    onPress={handleViewReceipt}
                    style={{
                      marginTop: 16,
                      backgroundColor: theme.blue10?.val,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text color="white" fontWeight="600">Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : receipt?.image ? (
                <Image
                  source={{ uri: receipt.image }}
                  style={{
                    width: screenWidth * 0.8,
                    height: screenHeight * 0.6,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="image-outline" size={48} color={theme.gray11?.val} />
                  <Text marginTop="$4" fontSize="$4" color="$gray11">No receipt image available</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExpenseDetailScreen; 