import React from 'react';
import { Box, Text, HStack, Avatar, useColorModeValue } from 'native-base';

// UserInfo component displays user's name and avatar
// Uses theme-aware colors for light/dark mode
const UserInfo = () => {
  // Static mock user data
  const user = {
    name: 'Jane Doe',
    avatarUrl: '', // Placeholder, can be replaced with real image
  };

  // Use theme-aware colors and a subtle gradient for depth
  const cardBg = useColorModeValue({
    linearGradient: {
      colors: ['blue.50', 'white'],
      start: [0, 0],
      end: [1, 1],
    },
  }, {
    linearGradient: {
      colors: ['blue.900', 'gray.800'],
      start: [0, 0],
      end: [1, 1],
    },
  });
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const text = useColorModeValue('gray.900', 'gray.100');
  const greeting = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box p={4} borderWidth={0} borderRadius={20} mb={6} bg={cardBg} shadow={2}>
      {/* Apple-style: Large avatar, friendly greeting, and name */}
      <HStack space={4} alignItems="center">
        <Avatar size="xl" source={user.avatarUrl ? { uri: user.avatarUrl } : undefined} bg="blue.400">
          {user.name[0]}
        </Avatar>
        <Box>
          <Text fontSize="lg" color={greeting} mb={1}>Good morning,</Text>
          <Text fontSize="2xl" fontWeight="bold" color={text}>{user.name}</Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default UserInfo; 