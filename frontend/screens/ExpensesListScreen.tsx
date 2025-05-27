import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Pressable,
  Icon,
  Select,
  CheckIcon,
  useToast,
  Badge,
  Divider,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as expenseService from '../services/expenseService';

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
  const toast = useToast();

  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, description
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // Theme colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');
  const subtext = useColorModeValue('gray.600', 'gray.400');

  // Load expenses from backend
  const loadExpenses = async (showLoading = true) => {
    try {
      console.log('loadExpenses called, showLoading:', showLoading);
      if (showLoading) {
        console.log('Setting loading to true');
        setLoading(true);
      }
      
      console.log('Calling expenseService.getExpenses()...');
      const data = await expenseService.getExpenses();
      console.log('Expenses loaded successfully:', data.length, 'expenses');
      setExpenses(data);
    } catch (error: any) {
      console.error('Failed to load expenses:', error);
      toast.show({
        title: 'Error',
        description: error.message || 'Failed to load expenses',
        duration: 3000,
      });
    } finally {
      console.log('loadExpenses finished, setting loading to false');
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  // Load expenses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses(false);
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

  // Render individual expense item
  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Pressable
      onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item._id })}
      mb={3}
    >
      <Box
        p={4}
        bg={cardBg}
        borderRadius={20}
        borderWidth={1}
        borderColor={border}
        shadow={2}
      >
        <HStack justifyContent="space-between" alignItems="flex-start" space={3}>
          {/* Left side: Icon and details */}
          <HStack space={3} flex={1} alignItems="flex-start">
            <Box
              p={2}
              bg="blue.100"
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={Ionicons}
                name={getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap}
                size="md"
                color="blue.600"
              />
            </Box>
            
            <VStack flex={1} space={1}>
              <Text fontSize="md" fontWeight="semibold" color={heading} numberOfLines={2}>
                {item.description}
              </Text>
              
              {item.vendor && (
                <Text fontSize="sm" color={subtext} numberOfLines={1}>
                  {item.vendor}
                </Text>
              )}
              
              <HStack space={2} alignItems="center" flexWrap="wrap">
                <Text fontSize="xs" color={subtext}>
                  {formatDate(item.date)}
                </Text>
                
                {item.category && (
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    borderRadius={8}
                    _text={{ fontSize: 'xs' }}
                  >
                    {item.category}
                  </Badge>
                )}
                
                {item.receiptId && (
                  <Icon
                    as={Ionicons}
                    name="camera"
                    size="xs"
                    color="green.500"
                  />
                )}
              </HStack>
            </VStack>
          </HStack>
          
          {/* Right side: Amount */}
          <VStack alignItems="flex-end" space={1}>
            <Text fontSize="lg" fontWeight="bold" color={heading}>
              {formatCurrency(item.amount)}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Center flex={1} p={8}>
      <Icon
        as={Ionicons}
        name="receipt-outline"
        size="6xl"
        color="gray.400"
        mb={4}
      />
      <Text fontSize="lg" fontWeight="semibold" color={heading} mb={2}>
        No Expenses Found
      </Text>
      <Text fontSize="md" color={subtext} textAlign="center" mb={6}>
        {searchQuery || selectedCategory
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first expense'}
      </Text>
      <Button
        colorScheme="blue"
        borderRadius={20}
        onPress={() => navigation.navigate('AddEditExpense')}
        leftIcon={<Icon as={Ionicons} name="add" size="sm" />}
      >
        Add Expense
      </Button>
    </Center>
  );

  // Show loading spinner
  console.log('Render: loading state is:', loading);
  if (loading) {
    console.log('Rendering loading screen');
    return (
      <Center flex={1} bg={bg}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={text}>Loading expenses...</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={bg}>
      {/* Header with summary */}
      <Box p={4} bg={cardBg} borderBottomWidth={1} borderBottomColor={border}>
        <VStack space={3}>
          {/* Summary stats */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="sm" color={subtext}>
                {filteredAndSortedExpenses.length} expense{filteredAndSortedExpenses.length !== 1 ? 's' : ''}
              </Text>
              <Text fontSize="xl" fontWeight="bold" color={heading}>
                {formatCurrency(totalAmount)}
              </Text>
            </VStack>
            
            <Button
              size="sm"
              colorScheme="blue"
              borderRadius={20}
              onPress={() => navigation.navigate('AddEditExpense')}
              leftIcon={<Icon as={Ionicons} name="add" size="xs" />}
            >
              Add
            </Button>
          </HStack>

          {/* Search bar */}
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            borderRadius={20}
            bg={bg}
            borderColor={border}
            InputLeftElement={
              <Icon
                as={Ionicons}
                name="search"
                size="sm"
                ml={3}
                color="gray.400"
              />
            }
            InputRightElement={
              searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')} mr={3}>
                  <Icon
                    as={Ionicons}
                    name="close-circle"
                    size="sm"
                    color="gray.400"
                  />
                </Pressable>
              ) : undefined
            }
          />

          {/* Filters and sort */}
          <HStack space={2} alignItems="center">
            {/* Category filter */}
            <Select
              flex={1}
              selectedValue={selectedCategory}
              onValueChange={(value: string) => setSelectedCategory(value || '')}
              placeholder="All Categories"
              borderRadius={20}
              bg={bg}
              borderColor={border}
              _selectedItem={{
                bg: 'blue.100',
                endIcon: <CheckIcon size="xs" />,
              }}
            >
              <Select.Item label="All Categories" value="" />
              {categories.map(category => (
                <Select.Item key={category} label={category} value={category} />
              ))}
            </Select>

            {/* Sort options */}
            <Select
              flex={1}
              selectedValue={`${sortBy}-${sortOrder}`}
              onValueChange={(value: string) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy || 'date');
                setSortOrder(newSortOrder || 'desc');
              }}
              borderRadius={20}
              bg={bg}
              borderColor={border}
              _selectedItem={{
                bg: 'blue.100',
                endIcon: <CheckIcon size="xs" />,
              }}
            >
              <Select.Item label="Newest First" value="date-desc" />
              <Select.Item label="Oldest First" value="date-asc" />
              <Select.Item label="Highest Amount" value="amount-desc" />
              <Select.Item label="Lowest Amount" value="amount-asc" />
              <Select.Item label="A-Z" value="description-asc" />
              <Select.Item label="Z-A" value="description-desc" />
            </Select>
          </HStack>
        </VStack>
      </Box>

      {/* Expenses list */}
      <Box flex={1} p={4}>
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
      </Box>
    </Box>
  );
};

export default ExpensesListScreen; 