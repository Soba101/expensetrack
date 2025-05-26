import React, { useState } from 'react';
import { Box, Text, VStack, HStack, useColorModeValue, Button, Pressable, Icon, Badge, Divider, Spinner } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseData } from '../context/ExpenseDataContext';

// Define the type for the navigation stack
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: undefined;
  ExpensesList: undefined;
  AddEditExpense: undefined;
  Categories: undefined;
  Reports: undefined;
  About: undefined;
};

// Enhanced RecentTransactions component with improved visual hierarchy and interactivity
// Features: Date grouping, status indicators, better icons, swipe actions, smart insights, real data from API
const RecentTransactions = () => {
  const [showAll, setShowAll] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  
  // Use centralized data context
  const { recentTransactions: transactions, loading } = useExpenseData();

  // Use theme-aware colors - MOVED TO TOP to fix hooks order
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');
  const subtext = useColorModeValue('gray.600', 'gray.400');
  const sectionHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const transactionItemBg = useColorModeValue('gray.50', 'gray.700');

  // Data loading is now handled by ExpenseDataContext

  // Group transactions by date
  const groupTransactionsByDate = (transactions: any[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: { [key: string]: any[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': []
    };

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const diffTime = today.getTime() - txDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups['Today'].push(tx);
      } else if (diffDays === 1) {
        groups['Yesterday'].push(tx);
      } else if (diffDays <= 7) {
        groups['This Week'].push(tx);
      }
    });

    return groups;
  };

  // Show only first 5 transactions initially
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);
  const groupedTransactions = groupTransactionsByDate(displayedTransactions);

  // Enhanced icon mapping with category-based colors
  const getTransactionIcon = (description: string, category: string) => {
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
      'default': { icon: 'card', color: '#6B7280', bg: '#F3F4F6' }
    };

    // Special cases for specific descriptions
    if (description.toLowerCase().includes('coffee')) {
      return { icon: 'cafe', color: '#92400E', bg: '#FEF3C7' };
    }
    if (description.toLowerCase().includes('groceries')) {
      return { icon: 'basket', color: '#059669', bg: '#D1FAE5' };
    }

    return iconMap[category] || iconMap.default;
  };

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'orange.500', text: 'Pending' };
      case 'completed':
        return { color: 'green.500', text: 'Completed' };
      default:
        return { color: 'gray.500', text: 'Unknown' };
    }
  };

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Show loading state
  if (loading) {
    return (
      <Box 
        p={6} 
        borderRadius={20} 
        bg={cardBg} 
        shadow={2}
        borderWidth={1}
        borderColor={border}
        mb={6}
        alignItems="center"
        justifyContent="center"
        minH={200}
      >
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={subtext}>
          Loading recent transactions...
        </Text>
      </Box>
    );
  }

  // Show empty state if no transactions
  if (transactions.length === 0) {
    return (
      <Box 
        p={6} 
        borderRadius={20} 
        bg={cardBg} 
        shadow={2}
        borderWidth={1}
        borderColor={border}
        mb={6}
        alignItems="center"
        justifyContent="center"
        minH={200}
      >
        <Icon as={Ionicons} name="receipt-outline" size="xl" color={subtext} />
        <Text mt={4} color={subtext} textAlign="center" fontSize="md">
          No transactions yet
        </Text>
        <Text mt={2} color={subtext} textAlign="center" fontSize="sm">
          Start by adding your first expense
        </Text>
      </Box>
    );
  }

  // Render individual transaction with enhanced design
  const renderTransaction = (tx: any) => {
    const iconData = getTransactionIcon(tx.description, tx.category);
    const statusData = getStatusIndicator(tx.status);
    const isExpanded = expandedTransaction === tx.id;

    return (
      <Pressable
        key={tx.id}
        onPress={() => setExpandedTransaction(isExpanded ? null : tx.id)}
        onLongPress={() => {
          // TODO: Show action menu
          console.log('Long press on transaction:', tx.id);
        }}
      >
        <Box
          p={3}
          borderRadius={12}
          bg={transactionItemBg}
          borderWidth={1}
          borderColor={isExpanded ? 'blue.300' : 'transparent'}
          mb={2}
        >
          <HStack justifyContent="space-between" alignItems="center" space={3}>
            {/* Icon and main info */}
            <HStack alignItems="center" space={3} flex={1}>
              <Box
                p={2}
                bg={iconData.bg}
                borderRadius={10}
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                <Ionicons 
                  name={iconData.icon as keyof typeof Ionicons.glyphMap} 
                  size={18} 
                  color={iconData.color} 
                />
                {/* Receipt indicator */}
                {tx.hasReceipt && (
                  <Box
                    position="absolute"
                    top={-1}
                    right={-1}
                    bg="blue.500"
                    borderRadius="full"
                    size={2}
                  />
                )}
              </Box>
              
              <VStack flex={1} space={0}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" fontWeight="600" color={text} flex={1}>
                    {tx.description}
                  </Text>
                  {tx.isUnusual && (
                    <Badge colorScheme="orange" variant="subtle" size="sm">
                      Unusual
                    </Badge>
                  )}
                </HStack>
                
                <HStack justifyContent="space-between" alignItems="center" mt={1}>
                  <Text fontSize="sm" color={subtext}>
                    {tx.vendor || tx.category}
                  </Text>
                  <Text fontSize="sm" color={statusData.color}>
                    {statusData.text}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Amount */}
            <VStack alignItems="flex-end" space={0}>
              <Text fontSize="lg" fontWeight="700" color={text}>
                ${tx.amount.toFixed(2)}
              </Text>
              <Text fontSize="xs" color={subtext}>
                {new Date(tx.date).toLocaleDateString()}
              </Text>
            </VStack>
          </HStack>

          {/* Expanded details */}
          {isExpanded && (
            <VStack space={2} mt={3} pt={3} borderTopWidth={1} borderTopColor={border}>
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color={subtext}>Category:</Text>
                <Text fontSize="sm" color={text} fontWeight="medium">{tx.category}</Text>
              </HStack>
              {tx.vendor && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={subtext}>Vendor:</Text>
                  <Text fontSize="sm" color={text} fontWeight="medium">{tx.vendor}</Text>
                </HStack>
              )}
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color={subtext}>Date:</Text>
                <Text fontSize="sm" color={text} fontWeight="medium">
                  {new Date(tx.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </HStack>
            </VStack>
          )}
        </Box>
      </Pressable>
    );
  };

  // Render grouped transactions
  const renderGroupedTransactions = () => {
    return Object.entries(groupedTransactions).map(([groupName, transactions]) => {
      if (transactions.length === 0) return null;

      return (
        <VStack key={groupName} space={2} mb={4}>
          <Text fontSize="xs" fontWeight="bold" color={subtext} textTransform="uppercase">
            {groupName}
          </Text>
          {transactions.map(renderTransaction)}
        </VStack>
      );
    });
  };

  return (
    <Box 
      p={5} 
      borderWidth={1} 
      borderRadius={20} 
      mb={6} 
      bg={cardBg} 
      borderColor={border} 
      shadow={2}
    >
      {/* Enhanced header with insights */}
      <HStack justifyContent="space-between" alignItems="center" mb={4}>
        <VStack>
          <Text fontSize="lg" fontWeight="bold" color={heading}>
            Recent Transactions
          </Text>
          {transactions.some(tx => tx.isUnusual) && (
            <HStack alignItems="center" space={1}>
              <Icon as={Ionicons} name="alert-circle" size="xs" color="orange.500" />
              <Text fontSize="xs" color="orange.500">
                Unusual spending detected
              </Text>
            </HStack>
          )}
        </VStack>
        
        {transactions.length > 5 && (
          <Pressable onPress={() => setShowAll(!showAll)}>
            <HStack alignItems="center" space={1}>
              <Text fontSize="sm" color="blue.500" fontWeight="medium">
                {showAll ? 'Show Less' : `+${transactions.length - 5} more`}
              </Text>
              <Icon 
                as={Ionicons} 
                name={showAll ? 'chevron-up' : 'chevron-down'} 
                size="xs" 
                color="blue.500" 
              />
            </HStack>
          </Pressable>
        )}
      </HStack>

      {/* Grouped transaction list */}
      {showAll ? renderGroupedTransactions() : (
        <VStack space={2}>
          {displayedTransactions.map(renderTransaction)}
        </VStack>
      )}

      {/* Enhanced action button */}
      <Button 
        mt={4} 
        colorScheme="blue" 
        borderRadius={16} 
        size="sm"
        onPress={() => navigation.navigate('ExpensesList')}
        _text={{ fontWeight: 'semibold' }}
        leftIcon={<Icon as={Ionicons} name="list" size="xs" />}
      >
        View All Expenses
      </Button>
    </Box>
  );
};

export default RecentTransactions; 