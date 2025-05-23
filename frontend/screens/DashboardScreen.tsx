import React from 'react';
import { ScrollView, useColorModeValue, Button, HStack, Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ExpenseSummary from '../components/ExpenseSummary';
import RecentTransactions from '../components/RecentTransactions';
import ExpenseBreakdown from '../components/ExpenseBreakdown';
import QuickActions from '../components/QuickActions';
import UserInfo from '../components/UserInfo';
import * as ImagePicker from 'expo-image-picker';

// DashboardScreen: Shows an overview of expenses and quick stats using modular components
const DashboardScreen: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const heading = useColorModeValue('gray.900', 'gray.100');
  const navigation = useNavigation();

  // Function to pick an image from the library (defined in DashboardScreen)
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // Use the string literal 'images'
      allowsEditing: true, // Allow basic editing
      aspect: [4, 3], // Maintain a 4:3 aspect ratio
      quality: 1, // Maximum quality
    });

    console.log(result);

    if (!result.canceled) {
      // For now, just log the URI. We will handle the upload later.
      console.log('Picked image URI:', result.assets[0].uri);
      // TODO: Implement upload logic here
    }
  };

  return (
    // Apple-style: Add extra top padding for visual comfort
    <ScrollView flex={1} bg={bg} p={4} pt={8}>
      {/* User info at the top */}
      <UserInfo />
      {/* Quick actions for adding expenses or uploading receipts */}
      <QuickActions onUploadPress={pickImage} />
      {/* Expense summary section */}
      <ExpenseSummary />
      {/* Expense breakdown by category */}
      <ExpenseBreakdown />
      {/* Recent transactions list */}
      <RecentTransactions />
    </ScrollView>
  );
};

export default DashboardScreen; 