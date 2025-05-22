import React from 'react';
import { Box, Text, VStack, useColorModeValue, HStack } from 'native-base';

// ExpenseSummary component displays total expenses for different periods
// Uses theme-aware colors for light/dark mode
const ExpenseSummary = () => {
  // Static mock data
  const totals = {
    month: 1200.50,
    year: 8500.75,
    allTime: 15000.00,
  };

  // Use theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box p={4} borderWidth={1} borderRadius={16} mb={4} bg={cardBg} borderColor={border} shadow={1}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={heading}>Expense Summary</Text>
      {/* Apple-style: Emphasize current month, use clear hierarchy */}
      <VStack space={2}>
        <HStack alignItems="flex-end" space={2}>
          <Text color={text} fontSize="md">This Month:</Text>
          <Text color="blue.500" fontSize="2xl" fontWeight="bold">${totals.month.toFixed(2)}</Text>
        </HStack>
        <HStack alignItems="flex-end" space={2}>
          <Text color={text} fontSize="md">This Year:</Text>
          <Text color={text} fontSize="lg" fontWeight="semibold">${totals.year.toFixed(2)}</Text>
        </HStack>
        <HStack alignItems="flex-end" space={2}>
          <Text color={text} fontSize="md">All Time:</Text>
          <Text color={text} fontSize="lg" fontWeight="semibold">${totals.allTime.toFixed(2)}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ExpenseSummary; 