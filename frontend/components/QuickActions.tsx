import React from 'react';
import { Box, Button, HStack, VStack, Text, useColorModeValue, Pressable } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the type for the navigation stack
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: undefined;
  ExpensesList: undefined;
  AddEditExpense: undefined;
  Categories: undefined;
  Reports: undefined;
  Settings: undefined;
  About: undefined;
};

// QuickActions component with Apple-style design
// Features: 2x2 grid layout, comprehensive actions, clean typography, proper spacing
interface QuickActionsProps {
  onUploadPress: () => void;
  isUploading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onUploadPress, isUploading = false }) => {
  // Apple-style colors with subtle backgrounds
  const cardBg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('coolGray.100', 'gray.700');
  const primaryText = useColorModeValue('gray.900', 'gray.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  
  // Action button colors - Apple's semantic color system
  const primaryActionBg = useColorModeValue('blue.500', 'blue.400');
  const secondaryActionBg = useColorModeValue('gray.100', 'gray.800');
  const accentActionBg = useColorModeValue('green.500', 'green.400');
  const infoActionBg = useColorModeValue('purple.500', 'purple.400');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Action button component with Apple-style design
  const ActionButton = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    colorScheme = 'gray',
    isLoading = false,
    isPrimary = false 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    colorScheme?: string;
    isLoading?: boolean;
    isPrimary?: boolean;
  }) => (
    <Pressable
      flex={1}
      onPress={onPress}
      disabled={isLoading}
      opacity={isLoading ? 0.6 : 1}
    >
      <Box
        p={4}
        borderRadius={16}
        bg={isPrimary ? primaryActionBg : secondaryActionBg}
        borderWidth={1}
        borderColor={border}
        shadow={isPrimary ? 2 : 1}
        minH="20"
        justifyContent="center"
        alignItems="center"
      >
        <VStack space={2} alignItems="center">
          <Box
            p={2}
            borderRadius={12}
            bg={isPrimary ? 'rgba(255,255,255,0.2)' : useColorModeValue('white', 'gray.700')}
          >
            <Ionicons 
              name={isLoading ? "hourglass" : icon as any} 
              size={24} 
              color={isPrimary ? 'white' : useColorModeValue('#3182ce', '#63b3ed')} 
            />
          </Box>
          <VStack space={0} alignItems="center">
            <Text 
              fontSize="sm" 
              fontWeight="600" 
              color={isPrimary ? 'white' : primaryText}
              textAlign="center"
            >
              {isLoading ? 'Processing...' : title}
            </Text>
            <Text 
              fontSize="xs" 
              color={isPrimary ? 'rgba(255,255,255,0.8)' : secondaryText}
              textAlign="center"
            >
              {subtitle}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Pressable>
  );

  return (
    <Box mb={6}>
      {/* Section Header - Apple's clean typography */}
      <Text 
        fontSize="lg" 
        fontWeight="600" 
        color={primaryText} 
        mb={4}
        px={1}
      >
        Quick Actions
      </Text>

      {/* 2x2 Grid Layout - Apple's organized, scannable design */}
      <VStack space={3}>
        {/* Top Row */}
        <HStack space={3}>
          <ActionButton
            icon="camera"
            title="Scan Receipt"
            subtitle="Auto-extract data"
            onPress={onUploadPress}
            isPrimary={true}
            isLoading={isUploading}
          />
          <ActionButton
            icon="add-circle"
            title="Add Expense"
            subtitle="Manual entry"
            onPress={() => navigation.navigate('AddEditExpense')}
          />
        </HStack>

        {/* Bottom Row */}
        <HStack space={3}>
          <ActionButton
            icon="bar-chart"
            title="View Reports"
            subtitle="Insights & trends"
            onPress={() => navigation.navigate('Reports')}
          />
          <ActionButton
            icon="search"
            title="Search"
            subtitle="Find expenses"
            onPress={() => navigation.navigate('ExpensesList')}
          />
        </HStack>
      </VStack>

      {/* Additional Quick Access - Apple's progressive disclosure */}
      <HStack space={3} mt={4} justifyContent="center">
        <Pressable onPress={() => navigation.navigate('Categories')}>
          <HStack alignItems="center" space={2} p={2}>
            <Ionicons name="pricetag" size={16} color={useColorModeValue('#6b7280', '#9ca3af')} />
            <Text fontSize="sm" color={secondaryText} fontWeight="500">
              Categories
            </Text>
          </HStack>
        </Pressable>
        
        {/* Settings icon for app settings */}
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <HStack alignItems="center" space={2} p={2}>
            <Ionicons name="settings-outline" size={16} color={useColorModeValue('#6b7280', '#9ca3af')} />
            <Text fontSize="sm" color={secondaryText} fontWeight="500">
              Settings
            </Text>
          </HStack>
        </Pressable>
      </HStack>
    </Box>
  );
};

export default QuickActions; 