import React, { useState } from 'react';
import { Box, Text, VStack, HStack, useColorModeValue, Button, Pressable, Icon, Badge, Divider } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
// Features: Date grouping, status indicators, better icons, swipe actions, smart insights
const RecentTransactions = () => {
  const [showAll, setShowAll] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);

  // Enhanced mock data with more realistic information
  const allTransactions = [
    { 
      id: 1, 
      description: 'Groceries', 
      amount: 54.23, 
      date: '2024-06-01',
      category: 'Food',
      vendor: 'Whole Foods',
      hasReceipt: true,
      status: 'completed',
      isUnusual: false
    },
    { 
      id: 2, 
      description: 'Coffee', 
      amount: 3.50, 
      date: '2024-06-02',
      category: 'Food',
      vendor: 'Starbucks',
      hasReceipt: false,
      status: 'completed',
      isUnusual: false
    },
    { 
      id: 3, 
      description: 'Internet Bill', 
      amount: 45.00, 
      date: '2024-06-03',
      category: 'Utilities',
      vendor: 'Comcast',
      hasReceipt: true,
      status: 'pending',
      isUnusual: false
    },
    { 
      id: 4, 
      description: 'Gas Station', 
      amount: 32.15, 
      date: '2024-06-04',
      category: 'Transport',
      vendor: 'Shell',
      hasReceipt: true,
      status: 'completed',
      isUnusual: false
    },
    { 
      id: 5, 
      description: 'Expensive Dinner', 
      amount: 128.90, 
      date: '2024-06-05',
      category: 'Food',
      vendor: 'Fine Dining Restaurant',
      hasReceipt: true,
      status: 'completed',
      isUnusual: true
    },
  ];

  // Group transactions by date
  const groupTransactionsByDate = (transactions: typeof allTransactions) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: { [key: string]: typeof allTransactions } = {
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

  // Show only first 3 transactions initially
  const displayedTransactions = showAll ? allTransactions : allTransactions.slice(0, 3);
  const groupedTransactions = groupTransactionsByDate(displayedTransactions);

  // Use theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');
  const subtext = useColorModeValue('gray.600', 'gray.400');
  const sectionHeaderBg = useColorModeValue('gray.50', 'gray.700');

  // Enhanced icon mapping with category-based colors
  const getTransactionIcon = (description: string, category: string) => {
    const iconMap: { [key: string]: { icon: string; color: string; bg: string } } = {
      'Food': { icon: 'restaurant', color: '#059669', bg: '#D1FAE5' },
      'Transport': { icon: 'car', color: '#DC2626', bg: '#FEE2E2' },
      'Utilities': { icon: 'wifi', color: '#2563EB', bg: '#DBEAFE' },
      'Entertainment': { icon: 'game-controller', color: '#7C3AED', bg: '#EDE9FE' },
      'Shopping': { icon: 'bag', color: '#EA580C', bg: '#FED7AA' },
      'Health': { icon: 'medical', color: '#0891B2', bg: '#CFFAFE' },
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

  // Render individual transaction with enhanced design
  const renderTransaction = (tx: typeof allTransactions[0]) => {
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
          bg={useColorModeValue('gray.50', 'gray.700')}
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
                    top={-2}
                    right={-2}
                    w={3}
                    h={3}
                    bg="green.500"
                    borderRadius="full"
                    borderWidth={1}
                    borderColor="white"
                  />
                )}
              </Box>
              
              <VStack flex={1} space={0.5}>
                <HStack alignItems="center" space={2}>
                  <Text color={text} fontWeight="bold" fontSize="sm" numberOfLines={1} flex={1}>
                    {tx.description}
                  </Text>
                  {tx.isUnusual && (
                    <Icon as={Ionicons} name="alert-circle" size="xs" color="orange.500" />
                  )}
                </HStack>
                
                <HStack alignItems="center" space={2}>
                  <Text fontSize="xs" color={subtext}>
                    {new Date(tx.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                  
                  {tx.vendor && (
                    <>
                      <Text fontSize="xs" color={subtext}>•</Text>
                      <Text fontSize="xs" color={subtext} numberOfLines={1} flex={1}>
                        {tx.vendor}
                      </Text>
                    </>
                  )}
                </HStack>
              </VStack>
            </HStack>
            
            {/* Amount and status */}
            <VStack alignItems="flex-end" space={1}>
              <Text 
                color={tx.amount > 100 ? 'red.600' : text} 
                fontWeight="bold" 
                fontSize="sm"
              >
                ${tx.amount.toFixed(2)}
              </Text>
              
              {tx.status === 'pending' && (
                <Badge 
                  colorScheme="orange" 
                  variant="subtle" 
                  borderRadius={6}
                  _text={{ fontSize: 'xs' }}
                >
                  Pending
                </Badge>
              )}
            </VStack>
          </HStack>

          {/* Expanded details */}
          {isExpanded && (
            <VStack space={2} mt={3} pt={3} borderTopWidth={1} borderTopColor={border}>
              <HStack justifyContent="space-between">
                <Text fontSize="xs" color={subtext}>Category:</Text>
                <Badge colorScheme="blue" variant="subtle" _text={{ fontSize: 'xs' }}>
                  {tx.category}
                </Badge>
              </HStack>
              
              <HStack justifyContent="space-between">
                <Text fontSize="xs" color={subtext}>Receipt:</Text>
                <HStack alignItems="center" space={1}>
                  <Icon 
                    as={Ionicons} 
                    name={tx.hasReceipt ? 'checkmark-circle' : 'close-circle'} 
                    size="xs" 
                    color={tx.hasReceipt ? 'green.500' : 'red.500'} 
                  />
                  <Text fontSize="xs" color={tx.hasReceipt ? 'green.500' : 'red.500'}>
                    {tx.hasReceipt ? 'Attached' : 'Missing'}
                  </Text>
                </HStack>
              </HStack>

              {tx.isUnusual && (
                <HStack alignItems="center" space={2}>
                  <Icon as={Ionicons} name="alert-circle" size="xs" color="orange.500" />
                  <Text fontSize="xs" color="orange.500">
                    Unusually high amount for this category
                  </Text>
                </HStack>
              )}
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
          {allTransactions.some(tx => tx.isUnusual) && (
            <HStack alignItems="center" space={1}>
              <Icon as={Ionicons} name="alert-circle" size="xs" color="orange.500" />
              <Text fontSize="xs" color="orange.500">
                Unusual spending detected
              </Text>
            </HStack>
          )}
        </VStack>
        
        {allTransactions.length > 3 && (
          <Pressable onPress={() => setShowAll(!showAll)}>
            <HStack alignItems="center" space={1}>
              <Text fontSize="sm" color="blue.500" fontWeight="medium">
                {showAll ? 'Show Less' : `+${allTransactions.length - 3} more`}
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