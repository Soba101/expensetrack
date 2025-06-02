import React from 'react';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';

// ExpenseBreakdown component shows expenses by category
// Uses theme-aware colors for light/dark mode
const ExpenseBreakdown = () => {
  // Static mock data
  const categories = [
    { name: 'Food', amount: 400 },
    { name: 'Utilities', amount: 200 },
    { name: 'Transport', amount: 150 },
    { name: 'Other', amount: 100 },
  ];

  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const heading = theme.color.val;
  const text = theme.color.val;

  // Category colors for visual distinction (Apple-style)
  const categoryColors = ['#3B82F6', '#14B8A6', '#F97316', '#6B7280'];

  return (
    <View 
      padding="$4" 
      borderWidth={1} 
      borderRadius="$6" 
      marginBottom="$6" 
      backgroundColor={cardBg} 
      borderColor={border}
    >
      <Text fontSize="$5" fontWeight="bold" marginBottom="$2" color={heading}>
        Expense Breakdown
      </Text>
      {/* Apple-style: Category color dots, bolder names, clear spacing */}
      <RNView style={{ gap: 12 }}>
        {categories.map((cat, idx) => (
          <RNView key={cat.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View 
                width={12} 
                height={12} 
                borderRadius="$10" 
                backgroundColor={categoryColors[idx % categoryColors.length]} 
              />
              <Text color={text} fontWeight="600">{cat.name}</Text>
            </RNView>
            <Text color={text}>${cat.amount.toFixed(2)}</Text>
          </RNView>
        ))}
      </RNView>
    </View>
  );
};

export default ExpenseBreakdown; 