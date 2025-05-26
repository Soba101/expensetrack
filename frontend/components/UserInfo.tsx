import React, { useState, useEffect } from 'react';
import { Box, Text, HStack, VStack, Avatar, useColorModeValue, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { getUserData } from '../services/authService';

// UserInfo component displays user's name and avatar with dynamic greeting
// Features: time-based greetings, contextual messages, modern design, real user data
const UserInfo = () => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUserData();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to default user if data loading fails
      setUser({ username: 'User', role: 'user' });
    }
  };

  // Get current time and date for dynamic content
  const now = new Date();
  const hour = now.getHours();
  const currentDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  // Get appropriate icon for time of day
  const getTimeIcon = () => {
    if (hour >= 6 && hour < 12) return 'sunny';
    if (hour >= 12 && hour < 18) return 'partly-sunny';
    if (hour >= 18 && hour < 22) return 'moon';
    return 'moon';
  };

  // Get contextual motivational message
  const getContextualMessage = () => {
    const messages = [
      "Ready to track your expenses?",
      "Let's make today financially smart!",
      "Your money, your control.",
      "Every expense tracked is progress made.",
      "Building better spending habits!",
      "Smart spending starts here!",
      "Take control of your finances!",
      "Every dollar counts!",
    ];
    // Use day of year to get consistent but varying message
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return messages[dayOfYear % messages.length];
  };

  // Format username for display (capitalize first letter)
  const getDisplayName = () => {
    if (!user?.username) return 'User';
    return user.username.charAt(0).toUpperCase() + user.username.slice(1);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    const words = user.username.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Theme-aware colors with enhanced gradients and modern styling
  const cardBg = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)'
  );
  const cardBgSolid = useColorModeValue('blue.500', 'gray.700'); // Fallback for gradient
  const text = useColorModeValue('white', 'gray.100');
  const subText = useColorModeValue('blue.100', 'gray.300');
  const iconColor = useColorModeValue('yellow.200', 'yellow.300');
  const dateColor = useColorModeValue('blue.200', 'gray.400');

  return (
    <Box 
      p={4} 
      borderRadius={16} 
      mb={4} 
      bg={cardBgSolid} // Using solid color as gradient fallback
      shadow={3}
      position="relative"
      overflow="hidden"
    >
      {/* Background gradient effect - using Box overlay for gradient simulation */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={cardBgSolid}
        opacity={0.9}
      />
      
      {/* Main content */}
      <HStack space={3} alignItems="center" position="relative" zIndex={1}>
        {/* User avatar with initials */}
        <Avatar 
          size="lg" 
          bg="white"
          _text={{ color: 'blue.500', fontWeight: 'bold', fontSize: 'lg' }}
          borderWidth={2}
          borderColor="white"
          shadow={2}
        >
          {getUserInitials()}
        </Avatar>
        
        {/* Compact greeting content */}
        <VStack flex={1} space={0.5}>
          {/* Time-based greeting with icon */}
          <HStack alignItems="center" space={1.5}>
            <Icon as={Ionicons} name={getTimeIcon()} size="xs" color={iconColor} />
            <Text fontSize="md" color={subText} fontWeight="medium">
              {getGreeting()},
            </Text>
          </HStack>
          
          {/* User name with smaller typography */}
          <Text fontSize="xl" fontWeight="bold" color={text} letterSpacing="tight">
            {getDisplayName()}
          </Text>
          
          {/* Current date */}
          <Text fontSize="xs" color={dateColor} fontWeight="medium">
            {currentDate}
          </Text>
          
          {/* Contextual motivational message */}
          <Text fontSize="xs" color={subText} fontStyle="italic" mt={0.5}>
            {getContextualMessage()}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default UserInfo; 