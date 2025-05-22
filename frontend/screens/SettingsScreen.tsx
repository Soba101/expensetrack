import React, { useState } from 'react';
import { Box, Text, VStack, Button, HStack, useColorMode, Divider, Avatar, useColorModeValue, ScrollView, Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// SettingsScreen: Apple-style user and app settings, appearance, navigation, and account actions
const SettingsScreen: React.FC = () => {
  const { colorMode, setColorMode } = useColorMode();
  const navigation = useNavigation();
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const text = useColorModeValue('gray.800', 'gray.200');
  // Ensure colorMode is always 'light' or 'dark' for initial state
  const initialAppearance: 'light' | 'dark' = colorMode === 'dark' ? 'dark' : 'light';
  const [appearance, setAppearance] = useState<'light' | 'dark'>(initialAppearance);

  // Mock user data
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    avatarUrl: '',
  };

  // Handle segmented control for appearance
  const handleAppearanceChange = (mode: 'light' | 'dark') => {
    setAppearance(mode);
    setColorMode(mode);
  };

  return (
    <ScrollView flex={1} bg={useColorModeValue('gray.50', 'gray.900')} p={4} pt={8}>
      {/* Account Section */}
      <Box p={4} borderWidth={1} borderRadius={20} mb={6} bg={cardBg} borderColor={border} shadow={2}>
        <HStack alignItems="center" space={5} mb={3}>
          <Avatar size="2xl" source={user.avatarUrl ? { uri: user.avatarUrl } : undefined} bg="blue.400">
            {user.name[0]}
          </Avatar>
          <VStack>
            <Text fontSize="xl" fontWeight="extrabold" color={heading}>{user.name}</Text>
            <Text fontSize="md" color={text}>{user.email}</Text>
          </VStack>
        </HStack>
        <HStack space={4}>
          <Button flex={1} variant="outline" borderRadius={16} onPress={() => { /* TODO: Edit profile */ }}>
            Edit Profile
          </Button>
          <Button flex={1} variant="outline" borderRadius={16} onPress={() => { /* TODO: Change password */ }}>
            Change Password
          </Button>
        </HStack>
      </Box>

      {/* Appearance Section with Segmented Control */}
      <Box p={4} borderWidth={1} borderRadius={20} mb={6} bg={cardBg} borderColor={border} shadow={2}>
        <Text fontSize="lg" fontWeight="bold" mb={3} color={heading}>Appearance</Text>
        <HStack bg={useColorModeValue('gray.100', 'gray.700')} borderRadius={12} p={1} alignSelf="center" w="60%" justifyContent="center">
          <Pressable flex={1} onPress={() => handleAppearanceChange('light')}>
            <Box
              py={2}
              borderRadius={10}
              bg={appearance === 'light' ? 'white' : 'transparent'}
              alignItems="center"
              shadow={appearance === 'light' ? 1 : 0}
            >
              <Text fontWeight={appearance === 'light' ? 'bold' : 'normal'} color={appearance === 'light' ? 'blue.500' : text}>Light</Text>
            </Box>
          </Pressable>
          <Pressable flex={1} onPress={() => handleAppearanceChange('dark')}>
            <Box
              py={2}
              borderRadius={10}
              bg={appearance === 'dark' ? 'white' : 'transparent'}
              alignItems="center"
              shadow={appearance === 'dark' ? 1 : 0}
            >
              <Text fontWeight={appearance === 'dark' ? 'bold' : 'normal'} color={appearance === 'dark' ? 'blue.500' : text}>Dark</Text>
            </Box>
          </Pressable>
        </HStack>
      </Box>

      {/* Navigation Section with right arrows */}
      <Box p={4} borderWidth={1} borderRadius={20} mb={6} bg={cardBg} borderColor={border} shadow={2}>
        <Text fontSize="lg" fontWeight="bold" mb={3} color={heading}>Navigation</Text>
        <VStack space={2}>
          <Pressable onPress={() => navigation.navigate('Reports' as never)}>
            <HStack alignItems="center" justifyContent="space-between" p={3} borderRadius={12} bg={useColorModeValue('gray.100', 'gray.700')}>
              <HStack alignItems="center" space={3}>
                <Ionicons name="bar-chart" size={22} color={useColorModeValue('#319795', '#81E6D9')} />
                <Text fontSize="md" fontWeight="semibold" color={heading}>View Reports</Text>
              </HStack>
              <Ionicons name="chevron-forward" size={20} color={useColorModeValue('#A0AEC0', '#CBD5E1')} />
            </HStack>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Categories' as never)}>
            <HStack alignItems="center" justifyContent="space-between" p={3} borderRadius={12} bg={useColorModeValue('gray.100', 'gray.700')}>
              <HStack alignItems="center" space={3}>
                <Ionicons name="pricetags" size={22} color={useColorModeValue('#D53F8C', '#F687B3')} />
                <Text fontSize="md" fontWeight="semibold" color={heading}>Manage Categories</Text>
              </HStack>
              <Ionicons name="chevron-forward" size={20} color={useColorModeValue('#A0AEC0', '#CBD5E1')} />
            </HStack>
          </Pressable>
        </VStack>
      </Box>

      {/* App Section */}
      <Box p={4} borderWidth={1} borderRadius={20} mb={6} bg={cardBg} borderColor={border} shadow={2}>
        <Text fontSize="lg" fontWeight="bold" mb={3} color={heading}>App</Text>
        <VStack space={3}>
          <Pressable onPress={() => navigation.navigate('About' as never)}>
            <HStack alignItems="center" justifyContent="space-between" p={3} borderRadius={12} bg={useColorModeValue('gray.100', 'gray.700')}>
              <HStack alignItems="center" space={3}>
                <Ionicons name="information-circle" size={22} color={useColorModeValue('#718096', '#CBD5E1')} />
                <Text fontSize="md" fontWeight="semibold" color={heading}>About</Text>
              </HStack>
              <Ionicons name="chevron-forward" size={20} color={useColorModeValue('#A0AEC0', '#CBD5E1')} />
            </HStack>
          </Pressable>
          <Button
            colorScheme="red"
            borderRadius={16}
            leftIcon={<Ionicons name="log-out" size={22} color="white" />}
            onPress={() => { /* TODO: Implement logout */ }}
          >
            Logout
          </Button>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default SettingsScreen; 