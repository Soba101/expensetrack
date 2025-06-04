import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, RefreshControl, TextInput, TouchableOpacity, View as RNView, Alert } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as expenseService from '../services/expenseService';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';
import { useExpenseData } from '../context/ExpenseDataContext';
import CategoryIcon from '../components/design-system/CategoryIcon';
import EmptyState from '../components/design-system/EmptyState';
import StatCard from '../components/design-system/StatCard';

// Define the navigation stack type
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: { expenseId: string };
  ExpensesList: undefined;
  AddEditExpense: { expenseId?: string } | undefined;
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

// ExpensesListScreen: Redesigned with Apple-inspired design and dynamic data
// Features: Advanced filtering, search, sorting, swipe actions, loading states
const ExpensesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  // Use centralized data context for dynamic data
  const { expenses, loading, refreshing, refreshData, deleteExpense } = useExpenseData();

  // State management for UI interactions
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, description
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showFilters, setShowFilters] = useState(false);

  // Load expenses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Handle pull-to-refresh with haptic feedback
  const onRefresh = () => {
    hapticFeedback.pullToRefresh();
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

  // Calculate statistics for filtered expenses
  const totalAmount = useMemo(() => {
    return filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredAndSortedExpenses]);

  const averageAmount = useMemo(() => {
    return filteredAndSortedExpenses.length > 0 ? totalAmount / filteredAndSortedExpenses.length : 0;
  }, [totalAmount, filteredAndSortedExpenses.length]);

  const receiptsCount = useMemo(() => {
    return filteredAndSortedExpenses.filter(expense => expense.receiptId).length;
  }, [filteredAndSortedExpenses]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(dateString);
  };

  // Handle expense deletion with confirmation
  const handleDeleteExpense = (expense: Expense) => {
    hapticFeedback.warning();
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              deleteExpense(expense._id);
              hapticFeedback.success();
              toast.success('Expense Deleted', 'The expense has been successfully deleted.');
            } catch (error) {
              hapticFeedback.error();
              toast.error('Delete Failed', 'Unable to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Render individual expense item with swipe actions
  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const handlePress = () => {
      hapticFeedback.buttonPress();
      navigation.navigate('ExpenseDetail', { expenseId: item._id });
    };

    const handleEdit = () => {
      hapticFeedback.buttonPress();
      // Navigate to edit screen with expense data
      (navigation as any).navigate('AddEditExpense', { expenseId: item._id });
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={{ marginBottom: 12 }}
        activeOpacity={0.7}
      >
        <View
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
          <RNView style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            {/* Category Icon */}
            <CategoryIcon category={item.category} size={40} iconSize={20} />
            
            {/* Expense Details */}
            <RNView style={{ flex: 1, minWidth: 0 }}>
              <Text fontSize={17} fontWeight="500" color="#000000" numberOfLines={1}>
                {item.description}
              </Text>
              <RNView style={{ marginTop: 2 }}>
                <Text fontSize={15} color="#8E8E93" numberOfLines={1}>
                  {item.category || 'Other'}
                  {item.vendor && ` • ${item.vendor}`}
                </Text>
              </RNView>
              <Text fontSize={13} color="#8E8E93" marginTop={4}>
                {getRelativeTime(item.date)}
              </Text>
            </RNView>
            
            {/* Amount and Actions */}
            <RNView style={{ alignItems: 'flex-end', minWidth: 80 }}>
              <Text fontSize={17} fontWeight="600" color="#000000">
                ${item.amount.toFixed(2)}
              </Text>
              {item.receiptId && (
                <RNView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginTop: 4,
                  backgroundColor: '#D1FAE5',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                  <Ionicons name="receipt" size={10} color="#059669" />
                  <Text fontSize={10} color="#059669" marginLeft={2}>
                    Receipt
                  </Text>
                </RNView>
              )}
              
              {/* Quick Actions */}
              <RNView style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    backgroundColor: '#F2F2F7',
                    padding: 6,
                    borderRadius: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={12} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteExpense(item)}
                  style={{
                    backgroundColor: '#FEE2E2',
                    padding: 6,
                    borderRadius: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={12} color="#DC2626" />
                </TouchableOpacity>
              </RNView>
            </RNView>
          </RNView>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <View style={{ paddingHorizontal: 20 }}>
      {[...Array(5)].map((_, index) => (
        <View
          key={`skeleton-${index}`}
          backgroundColor="white"
          borderRadius={12}
          padding={16}
          marginBottom={12}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="#F2F2F7"
            />
            <RNView style={{ flex: 1 }}>
              <View
                height={16}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                marginBottom={4}
                width="70%"
              />
              <View
                height={12}
                backgroundColor="#F2F2F7"
                borderRadius={4}
                width="50%"
              />
            </RNView>
            <View
              height={16}
              backgroundColor="#F2F2F7"
              borderRadius={4}
              width={60}
            />
          </RNView>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        {/* Back Button Row */}
        <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
        </RNView>

        {/* Title and Add Button Row */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <RNView style={{ flex: 1 }}>
            <Text fontSize={34} fontWeight="bold" color="#000000" marginBottom={4}>
              All Expenses
            </Text>
            <Text fontSize={17} color="#8E8E93" fontWeight="400">
              {filteredAndSortedExpenses.length} {filteredAndSortedExpenses.length === 1 ? 'expense' : 'expenses'}
              {searchQuery || selectedCategory ? ' (filtered)' : ''}
            </Text>
          </RNView>
          
          {/* Add Expense Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditExpense')}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text color="white" fontWeight="600">Add</Text>
          </TouchableOpacity>
        </RNView>
      </View>

      {/* Quick Stats */}
      {!loading && filteredAndSortedExpenses.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <RNView style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              label="Total"
              value={`$${totalAmount.toFixed(2)}`}
              subtitle={`${filteredAndSortedExpenses.length} ${filteredAndSortedExpenses.length === 1 ? 'expense' : 'expenses'}`}
              loading={loading}
            />
            <StatCard
              label="Average"
              value={`$${averageAmount.toFixed(0)}`}
              subtitle="per expense"
              loading={loading}
            />
            <StatCard
              label="Receipts"
              value={receiptsCount}
              subtitle="scanned"
              loading={loading}
            />
          </RNView>
        </View>
      )}

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        {/* Search Bar */}
        <View
          backgroundColor="white"
          borderRadius={12}
          padding={12}
          marginBottom={12}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              placeholder="Search expenses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 17,
                color: '#000000',
                paddingVertical: 4,
              }}
              placeholderTextColor="#8E8E93"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </RNView>
        </View>

        {/* Filter Controls */}
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
          {/* Category Filter */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              flex: 1,
              backgroundColor: selectedCategory ? '#007AFF' : 'white',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="filter" 
              size={16} 
              color={selectedCategory ? 'white' : '#007AFF'} 
            />
            <Text 
              color={selectedCategory ? 'white' : '#007AFF'} 
              fontWeight="600"
            >
              {selectedCategory || 'Filter'}
            </Text>
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color="#007AFF" 
            />
            <Text color="#007AFF" fontWeight="600">
              {sortBy === 'date' ? 'Date' : sortBy === 'amount' ? 'Amount' : 'Name'}
            </Text>
          </TouchableOpacity>
        </RNView>

        {/* Category Filter Dropdown */}
        {showFilters && (
          <View
            backgroundColor="white"
            borderRadius={12}
            padding={12}
            marginTop={12}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Text fontSize={15} fontWeight="600" color="#000000" marginBottom={8}>
              Filter by Category
            </Text>
            <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('');
                  setShowFilters(false);
                }}
                style={{
                  backgroundColor: !selectedCategory ? '#007AFF' : '#F2F2F7',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
                activeOpacity={0.8}
              >
                <Text 
                  color={!selectedCategory ? 'white' : '#8E8E93'} 
                  fontWeight="500"
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowFilters(false);
                  }}
                  style={{
                    backgroundColor: selectedCategory === category ? '#007AFF' : '#F2F2F7',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <Text 
                    color={selectedCategory === category ? 'white' : '#8E8E93'} 
                    fontWeight="500"
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </RNView>
          </View>
        )}
      </View>

      {/* Expenses List */}
      {loading ? (
        renderLoadingSkeleton()
      ) : filteredAndSortedExpenses.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}>
          <EmptyState
            icon="receipt-outline"
            title={searchQuery || selectedCategory ? "No matching expenses" : "No expenses yet"}
            description={searchQuery || selectedCategory ? "Try adjusting your search or filters" : "Start by adding your first expense"}
            buttonText={searchQuery || selectedCategory ? "Clear Filters" : "Add Expense"}
            onButtonPress={() => {
              if (searchQuery || selectedCategory) {
                setSearchQuery('');
                setSelectedCategory('');
                setShowFilters(false);
              } else {
                navigation.navigate('AddEditExpense');
              }
            }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ExpensesListScreen; 