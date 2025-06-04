import React from 'react';
import { View } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';

// CategoryIcon: Reusable component for category icons with colored backgrounds
// Provides consistent category visualization across all screens
interface CategoryIconProps {
  category?: string;
  size?: number;
  iconSize?: number;
}

interface IconData {
  icon: string;
  color: string;
  bg: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 40,
  iconSize = 20,
}) => {
  // Centralized category icon mapping - consistent across the app
  const getCategoryIcon = (category?: string): IconData => {
    const iconMap: { [key: string]: IconData } = {
      'Food & Dining': { icon: 'restaurant', color: '#059669', bg: '#D1FAE5' },
      'Transportation': { icon: 'car', color: '#DC2626', bg: '#FEE2E2' },
      'Bills & Utilities': { icon: 'wifi', color: '#2563EB', bg: '#DBEAFE' },
      'Entertainment': { icon: 'game-controller', color: '#7C3AED', bg: '#EDE9FE' },
      'Shopping': { icon: 'bag', color: '#EA580C', bg: '#FED7AA' },
      'Healthcare': { icon: 'medical', color: '#0891B2', bg: '#CFFAFE' },
      'Travel': { icon: 'airplane', color: '#7C2D12', bg: '#FEF3C7' },
      'Education': { icon: 'school', color: '#1D4ED8', bg: '#DBEAFE' },
      'Business': { icon: 'briefcase', color: '#374151', bg: '#F3F4F6' },
      'Personal Care': { icon: 'cut', color: '#BE185D', bg: '#FCE7F3' },
      'Groceries': { icon: 'basket', color: '#059669', bg: '#D1FAE5' },
      'Other': { icon: 'ellipsis-horizontal', color: '#6B7280', bg: '#F3F4F6' }
    };

    // Handle special cases and fallbacks
    if (!category) return iconMap['Other'];
    
    // Check for exact matches first
    if (iconMap[category]) return iconMap[category];
    
    // Fallback to partial matches
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return iconMap['Food & Dining'];
    if (categoryLower.includes('transport') || categoryLower.includes('car') || categoryLower.includes('uber')) return iconMap['Transportation'];
    if (categoryLower.includes('shop')) return iconMap['Shopping'];
    if (categoryLower.includes('health') || categoryLower.includes('medical')) return iconMap['Healthcare'];
    if (categoryLower.includes('entertainment') || categoryLower.includes('fun')) return iconMap['Entertainment'];
    if (categoryLower.includes('bill') || categoryLower.includes('utility')) return iconMap['Bills & Utilities'];
    if (categoryLower.includes('travel') || categoryLower.includes('trip')) return iconMap['Travel'];
    if (categoryLower.includes('education') || categoryLower.includes('school')) return iconMap['Education'];
    if (categoryLower.includes('business') || categoryLower.includes('work')) return iconMap['Business'];
    if (categoryLower.includes('personal') || categoryLower.includes('care')) return iconMap['Personal Care'];
    if (categoryLower.includes('groceries') || categoryLower.includes('grocery')) return iconMap['Groceries'];
    
    return iconMap['Other'];
  };

  const iconData = getCategoryIcon(category);

  return (
    <View
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor={iconData.bg}
      alignItems="center"
      justifyContent="center"
    >
      <Ionicons 
        name={iconData.icon as any} 
        size={iconSize} 
        color={iconData.color} 
      />
    </View>
  );
};

export default CategoryIcon; 