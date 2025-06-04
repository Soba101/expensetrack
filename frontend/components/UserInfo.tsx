import React, { useState, useEffect } from 'react';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
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

  // Using Tamagui theme instead of useColorModeValue
  const theme = useTheme();
  const cardBgSolid = '#3B82F6'; // Blue background color
  const text = theme.color.val;   // Main text (not used in this component)
  const subText = 'rgba(255, 255, 255, 0.85)';  // Improved subtitle text - semi-transparent white
  const iconColor = '#FCD34D';    // Brighter yellow icon for better contrast
  const dateColor = 'rgba(255, 255, 255, 0.75)';  // Improved date text - lighter semi-transparent white

  return (
    <View 
      padding="$4" 
      borderRadius="$6" 
      marginBottom="$4" 
      backgroundColor={cardBgSolid}
      position="relative"
      overflow="hidden"
    >
      {/* Background gradient effect - using View overlay for gradient simulation */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor={cardBgSolid}
        opacity={0.9}
      />
      
      {/* Main content */}
      <RNView style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1, gap: 12 }}>
        {/* User avatar with initials */}
        <View 
          width={60}
          height={60}
          borderRadius={30}
          backgroundColor="white"
          borderWidth={2}
          borderColor="white"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="#3B82F6" fontWeight="bold" fontSize="$5">
            {getUserInitials()}
          </Text>
        </View>
        
        {/* Compact greeting content */}
        <RNView style={{ flex: 1, gap: 4 }}>
          {/* Time-based greeting with icon */}
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={getTimeIcon()} size={16} color={iconColor} />
            <Text fontSize="$4" color={subText} fontWeight="500">
              {getGreeting()},
            </Text>
          </RNView>
          
          {/* User name with smaller typography */}
          <Text fontSize="$6" fontWeight="bold" color="white">
            {getDisplayName()}
          </Text>
          
          {/* Current date */}
          <Text fontSize="$2" color={dateColor} fontWeight="500">
            {currentDate}
          </Text>
          
          {/* Contextual motivational message */}
          <Text fontSize="$2" color={subText} fontStyle="italic">
            {getContextualMessage()}
          </Text>
        </RNView>
      </RNView>
    </View>
  );
};

export default UserInfo; 