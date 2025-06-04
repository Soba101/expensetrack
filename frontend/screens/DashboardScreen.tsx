import React, { useState } from 'react';
import { ScrollView, RefreshControl, Alert, StatusBar, View as RNView, TouchableOpacity, Dimensions } from 'react-native';
import { View, useTheme, Text } from '@tamagui/core';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as receiptService from '../services/receiptService';
import { useExpenseData } from '../context/ExpenseDataContext';
import { hapticFeedback } from '../utils/haptics';

// Custom toast hook for Tamagui (temporary implementation)
const useToast = () => {
  return {
    show: ({ title, description, duration }: { title: string; description: string; duration: number }) => {
      console.log(`Toast: ${title} - ${description}`);
    }
  };
};

const { width } = Dimensions.get('window');

// DashboardScreen: Apple-inspired design with focus on OCR receipt scanning
// Design principles: Clarity, simplicity, depth, and intuitive interactions
// Now fully dynamic and responsive with database data
const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const toast = useToast();
  
  // Get all data from context - now includes recentTransactions for dynamic content
  const { refreshData, loading, error, refreshing, summaryData, recentTransactions, expenses } = useExpenseData();
  const [isUploading, setIsUploading] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  // Helper function to get time-aware greeting
  const getTimeAwareGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to format relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get category icon with color
  const getCategoryIcon = (category?: string) => {
    const iconMap: { [key: string]: { icon: string; color: string; bg: string } } = {
      'Food & Dining': { icon: 'restaurant', color: '#059669', bg: '#D1FAE5' },
      'Transportation': { icon: 'car', color: '#DC2626', bg: '#FEE2E2' },
      'Bills & Utilities': { icon: 'wifi', color: '#2563EB', bg: '#DBEAFE' },
      'Entertainment': { icon: 'game-controller', color: '#7C3AED', bg: '#EDE9FE' },
      'Shopping': { icon: 'bag', color: '#EA580C', bg: '#FED7AA' },
      'Healthcare': { icon: 'medical', color: '#0891B2', bg: '#CFFAFE' },
      'Travel': { icon: 'airplane', color: '#7C2D12', bg: '#FEF3C7' },
      'Education': { icon: 'school', color: '#1D4ED8', bg: '#DBEAFE' },
      'Business': { icon: 'briefcase', color: '#374151', bg: '#F3F4F6' },
      'Personal Care': { icon: 'cut', color: '#BE185D', bg: '#FCE7F3' },
      'Groceries': { icon: 'basket', color: '#059669', bg: '#D1FAE5' },
      'Other': { icon: 'ellipsis-horizontal', color: '#6B7280', bg: '#F3F4F6' }
    };

    // Handle special cases based on description patterns
    if (!category) return iconMap['Other'];
    
    // Check for exact matches first
    if (iconMap[category]) return iconMap[category];
    
    // Fallback to partial matches
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return iconMap['Food & Dining'];
    if (categoryLower.includes('transport') || categoryLower.includes('car') || categoryLower.includes('uber')) return iconMap['Transportation'];
    if (categoryLower.includes('shop')) return iconMap['Shopping'];
    if (categoryLower.includes('health') || categoryLower.includes('medical')) return iconMap['Healthcare'];
    if (categoryLower.includes('entertainment') || categoryLower.includes('fun')) return iconMap['Entertainment'];
    
    return iconMap['Other'];
  };

  // Function to take a photo with camera
  const takePhoto = async () => {
    try {
      hapticFeedback.buttonPress();
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'Please allow camera access to scan receipts.',
          [{ text: 'Settings', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }]
        );
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Unable to access camera. Please try again.');
    }
  };

  // Function to pick image from gallery
  const pickImage = async () => {
    try {
      hapticFeedback.buttonPress();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Unable to access photo library. Please try again.');
    }
  };

  // Handle image upload and processing
  const handleImageUpload = async (imageUri: string) => {
    setIsUploading(true);
    
    try {
      const processedData = await receiptService.processReceiptImage(imageUri);
      const receiptUploadData: receiptService.ReceiptUploadData = {
        image: processedData.image,
        date: processedData.extractedData.date,
        amount: processedData.extractedData.amount,
        description: processedData.extractedData.description,
      };

      const uploadResponse = await receiptService.uploadReceipt(receiptUploadData);
      
      hapticFeedback.success();
      (navigation as any).navigate('AddEditExpense', { 
        receiptData: uploadResponse.receipt,
        isFromUpload: true 
      });

    } catch (error: any) {
      hapticFeedback.error();
      Alert.alert('Processing Failed', error.message || 'Unable to process receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate dynamic stats from summary data and expenses
  const currentSpent = summaryData?.currentMonth?.spent || 0;
  const monthlyBudget = summaryData?.currentMonth?.budget || 1000;
  const budgetProgress = (currentSpent / monthlyBudget) * 100;
  
  // Calculate actual receipts count from expenses with receiptId
  const receiptsCount = expenses.filter(expense => expense.receiptId).length;
  
  // Get recent transactions for display (limit to 3 for home screen)
  const displayTransactions = recentTransactions.slice(0, 3);

  // Handle navigation to expense detail
  const navigateToExpenseDetail = (transactionId: string) => {
    hapticFeedback.buttonPress();
    (navigation as any).navigate('ExpenseDetail', { expenseId: transactionId });
  };

  return (
    <ScrollView 
      style={{ 
        flex: 1, 
        backgroundColor: '#F2F2F7', // iOS system background
      }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          tintColor="#007AFF"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section - Now with dynamic time-aware greeting */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <RNView style={{ flex: 1 }}>
            <Text 
              fontSize={34} 
              fontWeight="bold" 
              color="#000000"
              marginBottom={4}
            >
              {getTimeAwareGreeting()}
            </Text>
            <Text 
              fontSize={17} 
              color="#8E8E93"
              fontWeight="400"
            >
              Ready to track your expenses?
            </Text>
          </RNView>
          
          {/* Profile/Settings Button */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Profile')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </RNView>
      </View>

      {/* Error State - Show when data fails to load */}
      {error && (
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            backgroundColor="#FEF2F2"
            borderRadius={12}
            padding={16}
            borderWidth={1}
            borderColor="#FECACA"
          >
            <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
              <RNView style={{ marginLeft: 12, flex: 1 }}>
                <Text fontSize={17} fontWeight="600" color="#DC2626">
                  Unable to Load Data
                </Text>
                <Text fontSize={15} color="#DC2626" marginTop={2}>
                  {error}
                </Text>
              </RNView>
              <TouchableOpacity
                onPress={refreshData}
                style={{
                  backgroundColor: '#DC2626',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
                activeOpacity={0.8}
              >
                <Text color="white" fontSize={14} fontWeight="600">
                  Retry
                </Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </View>
      )}

      {/* Main Scan Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <View
          backgroundColor="white"
          borderRadius={16}
          padding={24}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <Text 
            fontSize={22} 
            fontWeight="600" 
            color="#000000"
            textAlign="center"
            marginBottom={8}
          >
            Scan Receipt
          </Text>
          <Text 
            fontSize={15} 
            color="#8E8E93"
            textAlign="center"
            marginBottom={32}
            lineHeight={20}
          >
            AI will automatically extract amount, date, and merchant details
          </Text>

          {/* Large Scan Button */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={isUploading}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: isUploading ? '#E5E5EA' : '#007AFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isUploading ? 0 : 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <RNView style={{ alignItems: 'center' }}>
                  <Ionicons name="hourglass" size={32} color="#8E8E93" />
                  <Text fontSize={13} color="#8E8E93" fontWeight="500" marginTop={4}>
                    Processing
                  </Text>
                </RNView>
              ) : (
                <RNView style={{ alignItems: 'center' }}>
                  <Ionicons name="camera" size={36} color="white" />
                  <Text fontSize={15} color="white" fontWeight="600" marginTop={4}>
                    Scan
                  </Text>
                </RNView>
              )}
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <RNView style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={takePhoto}
              disabled={isUploading}
              style={{
                flex: 1,
                backgroundColor: '#F2F2F7',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isUploading ? 0.5 : 1,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={20} color="#007AFF" />
              <Text fontSize={15} color="#007AFF" fontWeight="500" marginTop={4}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              disabled={isUploading}
              style={{
                flex: 1,
                backgroundColor: '#F2F2F7',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isUploading ? 0.5 : 1,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="images-outline" size={20} color="#007AFF" />
              <Text fontSize={15} color="#007AFF" fontWeight="500" marginTop={4}>
                Photos
              </Text>
            </TouchableOpacity>
          </RNView>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text 
          fontSize={22} 
          fontWeight="600" 
          color="#000000"
          marginBottom={16}
        >
          Quick Actions
        </Text>
        
        <RNView style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {/* Add Manual Expense */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('AddEditExpense')}
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="#E3F2FD"
              alignItems="center"
              justifyContent="center"
              marginBottom={8}
            >
              <Ionicons name="add-circle" size={24} color="#1976D2" />
            </View>
            <Text fontSize={15} fontWeight="600" color="#000000" textAlign="center">
              Add Expense
            </Text>
            <Text fontSize={13} color="#8E8E93" textAlign="center" marginTop={2}>
              Manual entry
            </Text>
          </TouchableOpacity>

          {/* View All Expenses */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('ExpensesList')}
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="#F3E5F5"
              alignItems="center"
              justifyContent="center"
              marginBottom={8}
            >
              <Ionicons name="list" size={24} color="#7B1FA2" />
            </View>
            <Text fontSize={15} fontWeight="600" color="#000000" textAlign="center">
              All Expenses
            </Text>
            <Text fontSize={13} color="#8E8E93" textAlign="center" marginTop={2}>
              View & edit
            </Text>
          </TouchableOpacity>
        </RNView>

        <RNView style={{ flexDirection: 'row', gap: 12 }}>
          {/* Reports */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Reports')}
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="#E8F5E8"
              alignItems="center"
              justifyContent="center"
              marginBottom={8}
            >
              <Ionicons name="bar-chart" size={24} color="#388E3C" />
            </View>
            <Text fontSize={15} fontWeight="600" color="#000000" textAlign="center">
              Reports
            </Text>
            <Text fontSize={13} color="#8E8E93" textAlign="center" marginTop={2}>
              Analytics
            </Text>
          </TouchableOpacity>

          {/* Categories */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('CategoryManagement')}
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="#FFF3E0"
              alignItems="center"
              justifyContent="center"
              marginBottom={8}
            >
              <Ionicons name="pricetag" size={24} color="#F57C00" />
            </View>
            <Text fontSize={15} fontWeight="600" color="#000000" textAlign="center">
              Categories
            </Text>
            <Text fontSize={13} color="#8E8E93" textAlign="center" marginTop={2}>
              Manage
            </Text>
          </TouchableOpacity>
        </RNView>
      </View>

      {/* Quick Stats - Enhanced with dynamic data and loading states */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text 
          fontSize={22} 
          fontWeight="600" 
          color="#000000"
          marginBottom={16}
        >
          This Month
        </Text>
        
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
          {/* Spent Card */}
          <View
            flex={1}
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text fontSize={13} color="#8E8E93" fontWeight="500" marginBottom={4}>
              SPENT
            </Text>
            {loading ? (
              <View
                height={28}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                marginBottom={4}
                width="70%"
              />
            ) : (
              <Text fontSize={24} fontWeight="700" color="#000000">
                ${currentSpent.toLocaleString()}
              </Text>
            )}
            <Text fontSize={13} color="#8E8E93" marginTop={2}>
              of ${monthlyBudget.toLocaleString()}
            </Text>
          </View>

          {/* Receipts Card - Now shows actual receipt count */}
          <View
            flex={1}
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text fontSize={13} color="#8E8E93" fontWeight="500" marginBottom={4}>
              RECEIPTS
            </Text>
            {loading ? (
              <View
                height={28}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                marginBottom={4}
                width="50%"
              />
            ) : (
              <Text fontSize={24} fontWeight="700" color="#000000">
                {receiptsCount}
              </Text>
            )}
            <Text fontSize={13} color="#8E8E93" marginTop={2}>
              scanned
            </Text>
          </View>
        </RNView>

        {/* Transactions Count Card - New addition */}
        <RNView style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <View
            flex={1}
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text fontSize={13} color="#8E8E93" fontWeight="500" marginBottom={4}>
              TRANSACTIONS
            </Text>
            {loading ? (
              <View
                height={28}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                marginBottom={4}
                width="60%"
              />
            ) : (
              <Text fontSize={24} fontWeight="700" color="#000000">
                {expenses.length}
              </Text>
            )}
            <Text fontSize={13} color="#8E8E93" marginTop={2}>
              total
            </Text>
          </View>

          {/* Average Transaction Card */}
          <View
            flex={1}
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text fontSize={13} color="#8E8E93" fontWeight="500" marginBottom={4}>
              AVERAGE
            </Text>
            {loading ? (
              <View
                height={28}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                marginBottom={4}
                width="65%"
              />
            ) : (
              <Text fontSize={24} fontWeight="700" color="#000000">
                ${expenses.length > 0 ? (currentSpent / expenses.length).toFixed(0) : '0'}
              </Text>
            )}
            <Text fontSize={13} color="#8E8E93" marginTop={2}>
              per expense
            </Text>
          </View>
        </RNView>

        {/* Budget Progress - Enhanced with loading state */}
        <View
          backgroundColor="white"
          borderRadius={12}
          padding={16}
          marginTop={12}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text fontSize={17} fontWeight="600" color="#000000">
              Budget Progress
            </Text>
            {loading ? (
              <View
                height={20}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                width={50}
              />
            ) : (
              <Text fontSize={15} color={budgetProgress > 100 ? '#FF3B30' : '#34C759'} fontWeight="600">
                {budgetProgress.toFixed(0)}%
              </Text>
            )}
          </RNView>
          
          <View
            height={6}
            backgroundColor="#F2F2F7"
            borderRadius={3}
            overflow="hidden"
          >
            {!loading && (
              <View
                height="100%"
                width={`${Math.min(budgetProgress, 100)}%`}
                backgroundColor={budgetProgress > 100 ? '#FF3B30' : budgetProgress > 80 ? '#FF9500' : '#34C759'}
                borderRadius={3}
              />
            )}
          </View>
          
          {/* Budget insights */}
          {!loading && budgetProgress > 80 && (
            <RNView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Ionicons 
                name={budgetProgress > 100 ? "alert-circle" : "warning"} 
                size={14} 
                color={budgetProgress > 100 ? '#FF3B30' : '#FF9500'} 
              />
              <Text fontSize={13} color={budgetProgress > 100 ? '#FF3B30' : '#FF9500'} marginLeft={4}>
                {budgetProgress > 100 
                  ? `Over budget by $${(currentSpent - monthlyBudget).toFixed(0)}`
                  : 'Approaching budget limit'
                }
              </Text>
            </RNView>
          )}
        </View>
      </View>

      {/* Recent Activity - Now fully dynamic with database data */}
      <View style={{ paddingHorizontal: 20 }}>
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text fontSize={22} fontWeight="600" color="#000000">
            Recent Activity
          </Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('ExpensesList')}
            activeOpacity={0.7}
          >
            <Text fontSize={17} color="#007AFF" fontWeight="500">
              See All
            </Text>
          </TouchableOpacity>
        </RNView>

        {/* Activity List - Dynamic content with loading and empty states */}
        <View
          backgroundColor="white"
          borderRadius={12}
          overflow="hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          {loading ? (
            // Loading state with skeleton
            <>
              {[...Array(3)].map((_, index) => (
                <View
                  key={`skeleton-${index}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: index < 2 ? 0.5 : 0,
                    borderBottomColor: '#E5E5EA',
                  }}
                >
                  <View
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="#F2F2F7"
                    marginRight={12}
                  />
                  <RNView style={{ flex: 1 }}>
                    <View
                      height={16}
                      backgroundColor="#F2F2F7"
                      borderRadius={4}
                      marginBottom={4}
                      width="60%"
                    />
                    <View
                      height={12}
                      backgroundColor="#F2F2F7"
                      borderRadius={4}
                      width="40%"
                    />
                  </RNView>
                  <View
                    height={16}
                    backgroundColor="#F2F2F7"
                    borderRadius={4}
                    width={60}
                  />
                </View>
              ))}
            </>
          ) : displayTransactions.length === 0 ? (
            // Empty state
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={40} color="#8E8E93" />
              <Text fontSize={17} fontWeight="500" color="#8E8E93" marginTop={12} textAlign="center">
                No recent activity
              </Text>
              <Text fontSize={15} color="#8E8E93" marginTop={4} textAlign="center">
                Start by adding your first expense
              </Text>
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('AddEditExpense')}
                style={{
                  backgroundColor: '#007AFF',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 16,
                }}
                activeOpacity={0.8}
              >
                <Text color="white" fontWeight="600">
                  Add Expense
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Dynamic recent transactions from database
            displayTransactions.map((transaction, index) => {
              const iconData = getCategoryIcon(transaction.category);
              return (
                <TouchableOpacity
                  key={transaction.id}
                  onPress={() => navigateToExpenseDetail(transaction.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: index < displayTransactions.length - 1 ? 0.5 : 0,
                    borderBottomColor: '#E5E5EA',
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor={iconData.bg}
                    alignItems="center"
                    justifyContent="center"
                    marginRight={12}
                  >
                    <Ionicons 
                      name={iconData.icon as any} 
                      size={20} 
                      color={iconData.color} 
                    />
                  </View>
                  
                  <RNView style={{ flex: 1 }}>
                    <Text fontSize={17} fontWeight="500" color="#000000" numberOfLines={1}>
                      {transaction.description}
                    </Text>
                    <RNView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Text fontSize={15} color="#8E8E93">
                        {transaction.category}
                      </Text>
                      <Text fontSize={15} color="#8E8E93"> • </Text>
                      <Text fontSize={15} color="#8E8E93">
                        {getRelativeTime(transaction.date)}
                      </Text>
                      {transaction.hasReceipt && (
                        <>
                          <Text fontSize={15} color="#8E8E93"> • </Text>
                          <Ionicons name="receipt" size={12} color="#34C759" />
                        </>
                      )}
                    </RNView>
                  </RNView>
                  
                  <RNView style={{ alignItems: 'flex-end' }}>
                    <Text fontSize={17} fontWeight="600" color="#000000">
                      ${transaction.amount.toFixed(2)}
                    </Text>
                    {transaction.isUnusual && (
                      <RNView style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        marginTop: 2,
                        backgroundColor: '#FFF3CD',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Ionicons name="alert-circle" size={10} color="#856404" />
                        <Text fontSize={10} color="#856404" marginLeft={2}>
                          High
                        </Text>
                      </RNView>
                    )}
                  </RNView>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      {/* Processing Indicator */}
      {isUploading && (
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            backgroundColor="#E3F2FD"
            borderRadius={12}
            padding={16}
            borderWidth={1}
            borderColor="#BBDEFB"
          >
            <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="hourglass" size={24} color="#1976D2" />
              <RNView style={{ marginLeft: 12, flex: 1 }}>
                <Text fontSize={17} fontWeight="600" color="#1976D2">
                  Processing Receipt
                </Text>
                <Text fontSize={15} color="#1976D2" marginTop={2}>
                  AI is extracting expense details...
                </Text>
              </RNView>
            </RNView>
          </View>
        </View>
      )}

      {/* Settings & More */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text 
          fontSize={22} 
          fontWeight="600" 
          color="#000000"
          marginBottom={16}
        >
          More
        </Text>
        
        <View
          backgroundColor="white"
          borderRadius={12}
          overflow="hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          {/* Settings */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Settings')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: '#E5E5EA',
            }}
            activeOpacity={0.7}
          >
            <View
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="#F2F2F7"
              alignItems="center"
              justifyContent="center"
              marginRight={12}
            >
              <Ionicons name="settings" size={18} color="#007AFF" />
            </View>
            
            <RNView style={{ flex: 1 }}>
              <Text fontSize={17} fontWeight="500" color="#000000">
                Settings
              </Text>
              <Text fontSize={15} color="#8E8E93">
                Preferences and account
              </Text>
            </RNView>
            
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Export Data */}
          <TouchableOpacity
            onPress={() => {
              // Add export functionality here
              Alert.alert('Export Data', 'Export functionality will be implemented here.');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: '#E5E5EA',
            }}
            activeOpacity={0.7}
          >
            <View
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="#F2F2F7"
              alignItems="center"
              justifyContent="center"
              marginRight={12}
            >
              <Ionicons name="download" size={18} color="#007AFF" />
            </View>
            
            <RNView style={{ flex: 1 }}>
              <Text fontSize={17} fontWeight="500" color="#000000">
                Export Data
              </Text>
              <Text fontSize={15} color="#8E8E93">
                Download your expenses
              </Text>
            </RNView>
            
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Help & Support', 'Help documentation and support options will be available here.');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
            }}
            activeOpacity={0.7}
          >
            <View
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="#F2F2F7"
              alignItems="center"
              justifyContent="center"
              marginRight={12}
            >
              <Ionicons name="help-circle" size={18} color="#007AFF" />
            </View>
            
            <RNView style={{ flex: 1 }}>
              <Text fontSize={17} fontWeight="500" color="#000000">
                Help & Support
              </Text>
              <Text fontSize={15} color="#8E8E93">
                Get help and contact us
              </Text>
            </RNView>
            
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen; 