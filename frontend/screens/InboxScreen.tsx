import React from 'react';
import { Box, Text, VStack, HStack, Button, useColorModeValue, ScrollView, Center, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

// Mock inbox data: pending receipts to review
const inboxItems = [
  { id: 1, date: '2024-06-10', amount: 23.45 },
  { id: 2, date: '2024-06-09', amount: 54.99 },
  { id: 3, date: '2024-06-08', amount: 12.00 },
];

// InboxScreen: Shows pending receipts or uncategorized expenses
const InboxScreen: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');

  // If inbox is empty, show a friendly message
  if (inboxItems.length === 0) {
    return (
      <Center flex={1} bg={useColorModeValue('gray.50', 'gray.900')} px={4}>
        <Icon as={Ionicons} name="mail-open-outline" size="2xl" color="gray.400" mb={4} />
        <Text fontSize="xl" fontWeight="bold" color={heading} mb={2}>Inbox is empty</Text>
        <Text color={text} textAlign="center">You're all caught up! New receipts and notifications will appear here.</Text>
      </Center>
    );
  }

  // Otherwise, show the list of inbox items
  return (
    <ScrollView flex={1} bg={useColorModeValue('gray.50', 'gray.900')} p={4} pt={8}>
      <VStack space={4}>
        {inboxItems.map(item => (
          <Box key={item.id} p={4} borderWidth={1} borderRadius={20} mb={2} bg={cardBg} borderColor={border} shadow={2}>
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" space={3}>
                {/* Receipt icon */}
                <Icon as={Ionicons} name="receipt-outline" size="lg" color="blue.400" />
                <VStack>
                  <Text color={heading} fontWeight="semibold">Receipt</Text>
                  <Text color={text} fontSize="xs">{item.date}</Text>
                </VStack>
              </HStack>
              <Text color={heading} fontWeight="bold" fontSize="lg">${item.amount.toFixed(2)}</Text>
              <Button colorScheme="teal" borderRadius={16} size="sm">Review</Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </ScrollView>
  );
};

export default InboxScreen; 