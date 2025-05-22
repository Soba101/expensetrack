import React from 'react';
import { Box, Text, VStack, Button, HStack, useColorMode } from 'native-base';

// ProfileScreen: Shows user profile info and allows password changes.
// Now includes a light/dark mode toggle using NativeBase's color mode
const ProfileScreen: React.FC = () => {
  const { colorMode, setColorMode } = useColorMode();

  return (
    <Box flex={1} alignItems="center" justifyContent="flex-start" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>Profile</Text>
      {/* Light/Dark mode toggle */}
      <Box w="100%" maxW="400px" mb={8} p={4} borderWidth={1} borderRadius={16} bg={colorMode === 'dark' ? 'gray.800' : 'white'} shadow={2}>
        <Text fontSize="md" fontWeight="semibold" mb={4}>Appearance</Text>
        <HStack space={4} justifyContent="center">
          <Button
            variant={colorMode === 'light' ? 'solid' : 'outline'}
            onPress={() => setColorMode('light')}
            borderRadius={12}
            px={6}
          >
            Light
          </Button>
          <Button
            variant={colorMode === 'dark' ? 'solid' : 'outline'}
            onPress={() => setColorMode('dark')}
            borderRadius={12}
            px={6}
          >
            Dark
          </Button>
        </HStack>
      </Box>
      {/* Add user info and password change form here */}
    </Box>
  );
};

export default ProfileScreen; 