import React from 'react';
import { View, Text } from '@tamagui/core';
import { View as RNView } from 'react-native';

// StatCard: Reusable component for displaying statistics
// Follows the design system with loading states and consistent styling
interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  color?: string;
  backgroundColor?: string;
  flex?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  loading = false,
  color = '#000000',
  backgroundColor = 'white',
  flex = 1,
}) => {
  return (
    <View
      flex={flex}
      backgroundColor={backgroundColor}
      borderRadius={12}
      padding={16}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
        minHeight: 80, // Ensure consistent height
      }}
    >
      <Text fontSize={13} color="#8E8E93" fontWeight="500" marginBottom={8}>
        {label.toUpperCase()}
      </Text>
      
      {loading ? (
        <View
          height={24}
          backgroundColor="#F2F2F7"
          borderRadius={4}
          marginBottom={4}
          width="70%"
        />
      ) : (
        <Text fontSize={20} fontWeight="700" color={color} numberOfLines={1}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      )}
      
      {subtitle && !loading && (
        <Text fontSize={12} color="#8E8E93" marginTop={4} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default StatCard; 