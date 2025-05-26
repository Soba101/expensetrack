import React from 'react';
import { Box, Button, HStack, Text, useColorModeValue } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the type for the navigation stack
type RootStackParamList = {
  Home: undefined;
  Inbox: undefined;
  Settings: undefined;
  ExpenseDetail: undefined;
  ExpensesList: undefined;
  AddEditExpense: undefined;
  Categories: undefined;
  Reports: undefined;
  About: undefined;
};

// QuickActions component provides buttons for common actions
// Uses theme-aware colors for light/dark mode
// Define a prop type for onUploadPress
interface QuickActionsProps {
  onUploadPress: () => void; // Function to handle upload button press
  isUploading?: boolean; // Optional loading state for upload button
}

// const QuickActions = () => {
const QuickActions: React.FC<QuickActionsProps> = ({ onUploadPress, isUploading = false }) => {
  // Use theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Box p={4} borderWidth={1} borderRadius={20} mb={6} bg={cardBg} borderColor={border} shadow={2}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={heading}>Quick Actions</Text>
      {/* Apple-style: Icon buttons, rounded, spaced */}
      <HStack space={4}>
        <Button
          colorScheme="blue"
          flex={1}
          borderRadius={20}
          leftIcon={<Ionicons name={isUploading ? "hourglass" : "camera"} size={22} color="white" />}
          _text={{ fontWeight: 'bold', fontSize: 'md' }}
          onPress={onUploadPress}
          isLoading={isUploading}
          isDisabled={isUploading}
        >
          {isUploading ? 'Processing...' : 'Scan Receipt'}
        </Button>
        <Button
          colorScheme="teal"
          flex={1}
          borderRadius={20}
          leftIcon={<Ionicons name="add-circle" size={22} color="white" />}
          _text={{ fontWeight: 'bold', fontSize: 'md' }}
          onPress={() => navigation.navigate('AddEditExpense')}
        >
          Add Expense
        </Button>
      </HStack>
    </Box>
  );
};

export default QuickActions; 