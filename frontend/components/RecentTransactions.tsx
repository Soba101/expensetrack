import React from 'react';
import { Box, Text, VStack, HStack, useColorModeValue } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

// RecentTransactions component displays a list of recent expenses
// Uses theme-aware colors for light/dark mode
const RecentTransactions = () => {
  // Static mock data
  const transactions = [
    { id: 1, description: 'Groceries', amount: 54.23, date: '2024-06-01' },
    { id: 2, description: 'Coffee', amount: 3.50, date: '2024-06-02' },
    { id: 3, description: 'Internet Bill', amount: 45.00, date: '2024-06-03' },
  ];

  // Use theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');
  const dateColor = useColorModeValue('gray.500', 'gray.400');

  // Map transaction descriptions to icons (Apple-style)
  const iconMap = {
    Groceries: 'cart',
    Coffee: 'cafe',
    'Internet Bill': 'wifi',
    default: 'card',
  };

  return (
    <Box p={4} borderWidth={1} borderRadius={16} mb={4} bg={cardBg} borderColor={border} shadow={1}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={heading}>Recent Transactions</Text>
      {/* Apple-style: Add icons, bolder descriptions, clear spacing */}
      <VStack space={3}>
        {transactions.map(tx => (
          <HStack key={tx.id} justifyContent="space-between" alignItems="center" space={2}>
            <HStack alignItems="center" space={2}>
              <Ionicons name={iconMap[tx.description] || iconMap.default} size={18} color="#3182ce" />
              <Text color={text} fontWeight="semibold">{tx.description}</Text>
            </HStack>
            <Text color={text}>${tx.amount.toFixed(2)}</Text>
            <Text fontSize="xs" color={dateColor}>{tx.date}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default RecentTransactions; 