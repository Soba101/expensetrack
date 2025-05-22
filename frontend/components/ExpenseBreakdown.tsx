import React from 'react';
import { Box, Text, VStack, HStack, useColorModeValue, Circle } from 'native-base';

// ExpenseBreakdown component shows expenses by category
// Uses theme-aware colors for light/dark mode
const ExpenseBreakdown = () => {
  // Static mock data
  const categories = [
    { name: 'Food', amount: 400 },
    { name: 'Utilities', amount: 200 },
    { name: 'Transport', amount: 150 },
    { name: 'Other', amount: 100 },
  ];

  // Use theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');

  // Category colors for visual distinction (Apple-style)
  const categoryColors = ['blue.400', 'teal.400', 'orange.400', 'gray.400'];

  return (
    <Box p={4} borderWidth={1} borderRadius={16} mb={4} bg={cardBg} borderColor={border} shadow={1}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={heading}>Expense Breakdown</Text>
      {/* Apple-style: Category color dots, bolder names, clear spacing */}
      <VStack space={3}>
        {categories.map((cat, idx) => (
          <HStack key={cat.name} justifyContent="space-between" alignItems="center" space={2}>
            <HStack alignItems="center" space={2}>
              <Circle size={3} bg={categoryColors[idx % categoryColors.length]} />
              <Text color={text} fontWeight="semibold">{cat.name}</Text>
            </HStack>
            <Text color={text}>${cat.amount.toFixed(2)}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default ExpenseBreakdown; 