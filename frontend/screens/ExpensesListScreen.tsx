import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, RefreshControl, TextInput, TouchableOpacity, View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as expenseService from '../services/expenseService';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';
import { useExpenseData } from '../context/ExpenseDataContext';

// Define the navigation stack type
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: { expenseId: string };
  ExpensesList: undefined;
  AddEditExpense: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpensesList'>;

// Interface for expense data from backend
interface Expense {
  _id: string;
  user: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  vendor?: string;
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
}

// ExpensesListScreen: Comprehensive list of all expenses with search, filter, and sort
const ExpensesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Use centralized data context instead of local state
  const { expenses, loading, refreshing, refreshData } = useExpenseData();

  // State management for UI only
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, description
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const heading = theme.color.val;
  const text = theme.color.val;
  const subtext = theme.colorHover.val;

  // Load expenses when screen comes into focus using context
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Handle pull-to-refresh with haptic feedback
  const onRefresh = () => {
    hapticFeedback.pullToRefresh(); // Add haptic feedback
    refreshData();
  };

  // Get unique categories from expenses for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses
      .map(expense => expense.category)
      .filter((category): category is string => category !== undefined && category.trim() !== '')
    )];
    return uniqueCategories.sort();
  }, [expenses]);

  // Filter and sort expenses based on current filters
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(query) ||
        expense.vendor?.toLowerCase().includes(query) ||
        expense.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Calculate total amount for filtered expenses
  const totalAmount = useMemo(() => {
    return filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredAndSortedExpenses]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get icon for category
  const getCategoryIcon = (category?: string) => {
    if (!category) return 'receipt-outline';
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('restaurant')) return 'restaurant-outline';
    if (categoryLower.includes('travel') || categoryLower.includes('transport')) return 'car-outline';
    if (categoryLower.includes('office') || categoryLower.includes('work')) return 'briefcase-outline';
    if (categoryLower.includes('health') || categoryLower.includes('medical')) return 'medical-outline';
    if (categoryLower.includes('entertainment') || categoryLower.includes('fun')) return 'game-controller-outline';
    return 'receipt-outline';
  };

  // Render individual expense item with haptic feedback
  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const handlePress = () => {
      hapticFeedback.buttonPress(); // Add haptic feedback for navigation
      navigation.navigate('ExpenseDetail', { expenseId: item._id });
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={{ marginBottom: 12 }}
        activeOpacity={0.7}
      >
        <View
          padding="$4"
          backgroundColor={cardBg}
          borderRadius="$6"
          borderWidth={1}
          borderColor={border}
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            {/* Left side: Icon and details */}
            <RNView style={{ flexDirection: 'row', gap: 12, flex: 1, alignItems: 'flex-start' }}>
              <View
                padding="$2"
                backgroundColor="#EBF8FF"
                borderRadius="$6"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name={getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color="#2563EB"
                />
              </View>
              
              <RNView style={{ flex: 1, gap: 4 }}>
                <Text fontSize="$4" fontWeight="600" color={heading} numberOfLines={2}>
                  {item.description}
                </Text>
                
                {item.vendor && (
                  <Text fontSize="$3" color={subtext} numberOfLines={1}>
                    {item.vendor}
                  </Text>
                )}
                
                <RNView style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text fontSize="$2" color={subtext}>
                    {formatDate(item.date)}
                  </Text>
                  
                  {item.category && (
                    <View
                      backgroundColor="#EBF8FF"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                    >
                      <Text fontSize="$2" color="#1D4ED8" fontWeight="500">
                        {item.category}
                      </Text>
                    </View>
                  )}
                  
                  {item.receiptId && (
                    <Ionicons
                      name="camera"
                      size={12}
                      color="#10B981"
                    />
                  )}
                </RNView>
              </RNView>
            </RNView>
            
            {/* Right side: Amount */}
            <RNView style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text fontSize="$5" fontWeight="bold" color={heading}>
                {formatCurrency(item.amount)}
              </Text>
            </RNView>
          </RNView>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <RNView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <Ionicons
        name="receipt-outline"
        size={96}
        color={subtext}
        style={{ marginBottom: 16 }}
      />
      <Text fontSize="$5" fontWeight="600" color={heading} marginBottom="$2">
        No Expenses Found
      </Text>
      <Text fontSize="$4" color={subtext} textAlign="center" marginBottom="$6">
        {searchQuery || selectedCategory
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first expense'}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddEditExpense')}
        style={{
          backgroundColor: '#3B82F6',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Ionicons name="add" size={16} color="white" />
        <Text fontSize="$4" fontWeight="600" color="white">
          Add Expense
        </Text>
      </TouchableOpacity>
    </RNView>
  );

  // Show loading spinner
  console.log('Render: loading state is:', loading);
  if (loading) {
    console.log('Rendering loading screen');
    return (
      <RNView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <Text color="#3B82F6">⏳</Text>
        <Text marginTop="$4" color={text}>Loading expenses...</Text>
      </RNView>
    );
  }

  return (
    <RNView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header with summary */}
      <View padding="$4" backgroundColor={cardBg} borderBottomWidth={1} borderBottomColor={border}>
        <RNView style={{ gap: 12 }}>
          {/* Summary stats */}
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <RNView>
              <Text fontSize="$3" color={subtext}>
                {filteredAndSortedExpenses.length} expense{filteredAndSortedExpenses.length !== 1 ? 's' : ''}
              </Text>
              <Text fontSize="$6" fontWeight="bold" color={heading}>
                {formatCurrency(totalAmount)}
              </Text>
            </RNView>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('AddEditExpense')}
              style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="add" size={12} color="white" />
              <Text fontSize="$3" fontWeight="600" color="white">
                Add
              </Text>
            </TouchableOpacity>
          </RNView>

          {/* Search bar */}
          <RNView style={{ position: 'relative' }}>
            <TextInput
              placeholder="Search expenses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                borderRadius: 20,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: border,
                paddingHorizontal: 40,
                paddingVertical: 12,
                fontSize: 16,
                color: text,
              }}
              placeholderTextColor={subtext}
            />
            <RNView style={{ position: 'absolute', left: 12, top: 12 }}>
              <Ionicons name="search" size={20} color={subtext} />
            </RNView>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 12, top: 12 }}
              >
                <Ionicons name="close-circle" size={20} color={subtext} />
              </TouchableOpacity>
            )}
          </RNView>

          {/* Filters and sort */}
          <RNView style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {/* Category filter - Simplified */}
            <RNView style={{ flex: 1, gap: 4 }}>
              <Text fontSize="$2" color={subtext}>Category</Text>
              <RNView style={{ gap: 4 }}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory('')}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: !selectedCategory ? '#3B82F6' : border,
                    backgroundColor: !selectedCategory ? '#EBF8FF' : bg,
                  }}
                >
                  <Text 
                    fontSize="$2" 
                    color={!selectedCategory ? '#1D4ED8' : text}
                    fontWeight={!selectedCategory ? '600' : '400'}
                  >
                    All Categories
                  </Text>
                </TouchableOpacity>
                {categories.slice(0, 3).map(category => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selectedCategory === category ? '#3B82F6' : border,
                      backgroundColor: selectedCategory === category ? '#EBF8FF' : bg,
                    }}
                  >
                    <Text 
                      fontSize="$2" 
                      color={selectedCategory === category ? '#1D4ED8' : text}
                      fontWeight={selectedCategory === category ? '600' : '400'}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </RNView>
            </RNView>

            {/* Sort options - Simplified */}
            <RNView style={{ flex: 1, gap: 4 }}>
              <Text fontSize="$2" color={subtext}>Sort</Text>
              <RNView style={{ gap: 4 }}>
                {[
                  { label: 'Newest First', value: 'date-desc' },
                  { label: 'Highest Amount', value: 'amount-desc' },
                  { label: 'A-Z', value: 'description-asc' },
                ].map(option => {
                  const isSelected = `${sortBy}-${sortOrder}` === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        const [newSortBy, newSortOrder] = option.value.split('-');
                        setSortBy(newSortBy || 'date');
                        setSortOrder(newSortOrder || 'desc');
                      }}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? '#3B82F6' : border,
                        backgroundColor: isSelected ? '#EBF8FF' : bg,
                      }}
                    >
                      <Text 
                        fontSize="$2" 
                        color={isSelected ? '#1D4ED8' : text}
                        fontWeight={isSelected ? '600' : '400'}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </RNView>
            </RNView>
          </RNView>
        </RNView>
      </View>

      {/* Expenses list */}
      <View flex={1} padding="$4">
        {filteredAndSortedExpenses.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredAndSortedExpenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3182ce']}
                tintColor="#3182ce"
              />
            }
          />
        )}
      </View>
    </RNView>
  );
};

export default ExpensesListScreen; 