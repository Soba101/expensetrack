import React from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
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

// QuickActions component with simplified Tamagui design
interface QuickActionsProps {
  onUploadPress: () => void;
  isUploading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onUploadPress, isUploading = false }) => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Action button component with simplified design
  const ActionButton = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    isLoading = false,
    isPrimary = false 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    isLoading?: boolean;
    isPrimary?: boolean;
  }) => (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={onPress}
      disabled={isLoading}
    >
      <View
        padding="$4"
        borderRadius="$6"
        backgroundColor={isPrimary ? '#3B82F6' : theme.backgroundHover.val}
        borderWidth={1}
        borderColor={theme.borderColor.val}
        minHeight={80}
        justifyContent="center"
        alignItems="center"
      >
        <RNView style={{ alignItems: 'center', gap: 8 }}>
          <View
            padding="$2"
            borderRadius="$6"
            backgroundColor={isPrimary ? 'rgba(255,255,255,0.2)' : 'white'}
          >
            <Ionicons 
              name={isLoading ? "hourglass" : icon as any} 
              size={24} 
              color={isPrimary ? 'white' : '#3182ce'} 
            />
          </View>
          <RNView style={{ alignItems: 'center' }}>
            <Text 
              fontSize="$4" 
              fontWeight="600" 
              color={isPrimary ? 'white' : theme.color.val}
              textAlign="center"
            >
              {isLoading ? 'Processing...' : title}
            </Text>
            <Text 
              fontSize="$2" 
              color={isPrimary ? 'rgba(255,255,255,0.8)' : theme.color11?.val || '#64748B'}
              textAlign="center"
            >
              {subtitle}
            </Text>
          </RNView>
        </RNView>
      </View>
    </TouchableOpacity>
  );

  return (
    <View marginBottom="$6">
      {/* Section Header */}
      <Text 
        fontSize="$5" 
        fontWeight="600" 
        color={theme.color.val} 
        marginBottom="$4"
        paddingHorizontal="$1"
      >
        Quick Actions
      </Text>

      {/* 2x2 Grid Layout */}
      <RNView style={{ gap: 12 }}>
        {/* Top Row */}
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
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
        </RNView>

        {/* Bottom Row */}
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
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
        </RNView>
      </RNView>

      {/* Additional Quick Access */}
      <RNView style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'center' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 }}>
            <Ionicons name="pricetag" size={16} color="#6b7280" />
            <Text fontSize="$3" color={theme.color11?.val || '#64748B'} fontWeight="500">
              Categories
            </Text>
          </RNView>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 }}>
            <Ionicons name="settings-outline" size={16} color="#6b7280" />
            <Text fontSize="$3" color={theme.color11?.val || '#64748B'} fontWeight="500">
              Settings
            </Text>
          </RNView>
        </TouchableOpacity>
      </RNView>
    </View>
  );
};

export default QuickActions; 