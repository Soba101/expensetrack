import React from 'react';
import { Box, Button, HStack, Text, useColorModeValue } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

// QuickActions component provides buttons for common actions
// Uses theme-aware colors for light/dark mode
const QuickActions = () => {
  // Use theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');

  return (
    <Box p={4} borderWidth={1} borderRadius={16} mb={4} bg={cardBg} borderColor={border}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={heading}>Quick Actions</Text>
      {/* Apple-style: Icon buttons, rounded, spaced */}
      <HStack space={4}>
        <Button
          colorScheme="blue"
          flex={1}
          borderRadius={20}
          leftIcon={<Ionicons name="add-circle" size={22} color="white" />}
          _text={{ fontWeight: 'bold', fontSize: 'md' }}
        >
          Add Expense
        </Button>
        <Button
          colorScheme="teal"
          flex={1}
          borderRadius={20}
          leftIcon={<Ionicons name="cloud-upload" size={22} color="white" />}
          _text={{ fontWeight: 'bold', fontSize: 'md' }}
        >
          Upload Receipt
        </Button>
      </HStack>
    </Box>
  );
};

export default QuickActions; 