import React, { useState, useEffect } from 'react';
import { ScrollView, View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import * as expenseService from '../services/expenseService';

// CategoriesScreen: Shows and manages expense categories with real data
// Features: Dynamic category list, spending amounts per category, modern UI design
const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: { amount: number; count: number } }>({});
  const [loading, setLoading] = useState(true);
  
  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();

  // Load categories and their statistics on component mount
  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = async () => {
    try {
      setLoading(true);
      
      // Get categories and expenses
      const [categoriesList, expenses] = await Promise.all([
        expenseService.getCategories(),
        expenseService.getExpenses()
      ]);
      
      setCategories(categoriesList);
      
      // Calculate statistics for each category
      const stats: { [key: string]: { amount: number; count: number } } = {};
      
      expenses.forEach(expense => {
        const category = expense.category || 'Other';
        if (!stats[category]) {
          stats[category] = { amount: 0, count: 0 };
        }
        stats[category].amount += expense.amount;
        stats[category].count += 1;
      });
      
      setCategoryStats(stats);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      // TODO: Replace with Tamagui toast system
      console.log('Error Loading Categories: Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get category icon based on category name
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: { icon: string; color: string; bg: string } } = {
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

    return iconMap[category] || iconMap['Other'];
  };

  // Show loading state
  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.background.val }}>
        <View padding="$4" paddingTop="$6">
          <View 
            padding="$6" 
            borderRadius="$6" 
            backgroundColor={theme.backgroundHover.val}
            borderWidth={1}
            borderColor={theme.borderColor.val}
            alignItems="center"
            justifyContent="center"
            minHeight={300}
          >
            <Text color={theme.colorHover.val}>Loading...</Text>
            <Text marginTop="$4" color={theme.colorHover.val}>
              Loading categories...
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background.val }}>
      <View padding="$4" paddingTop="$6">
        {/* Header */}
        <View 
          padding="$6" 
          borderRadius="$6" 
          backgroundColor="$blue2"
          borderWidth={1}
          borderColor={theme.borderColor.val}
          marginBottom="$6"
        >
          <RNView style={{ gap: 8 }}>
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="pricetag" size={24} color="#3B82F6" />
              <Text fontSize="$8" fontWeight="bold" color={theme.color.val}>
                Expense Categories
              </Text>
            </RNView>
            <Text fontSize="$4" color={theme.colorHover.val}>
              {categories.length} categories • {Object.values(categoryStats).reduce((sum, stat) => sum + stat.count, 0)} total expenses
            </Text>
          </RNView>
        </View>

        {/* Categories List */}
        <RNView style={{ gap: 12 }}>
          {categories.map((category) => {
            const iconData = getCategoryIcon(category);
            const stats = categoryStats[category] || { amount: 0, count: 0 };
            
            return (
              <TouchableOpacity key={category}>
                <View
                  padding="$4"
                  borderRadius="$6"
                  backgroundColor={theme.backgroundHover.val}
                  borderWidth={1}
                  borderColor={theme.borderColor.val}
                >
                  <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {/* Category Icon */}
                    <View
                      padding="$3"
                      backgroundColor={iconData.bg}
                      borderRadius="$6"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons
                        name={iconData.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={iconData.color}
                      />
                    </View>

                    {/* Category Info */}
                    <RNView style={{ flex: 1, gap: 4 }}>
                      <Text fontSize="$5" fontWeight="600" color={theme.color.val}>
                        {category}
                      </Text>
                      <Text fontSize="$3" color={theme.colorHover.val}>
                        {stats.count} {stats.count === 1 ? 'expense' : 'expenses'}
                      </Text>
                    </RNView>

                    {/* Amount */}
                    <RNView style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text fontSize="$6" fontWeight="bold" color={theme.color.val}>
                        ${stats.amount.toFixed(2)}
                      </Text>
                      <Text fontSize="$2" color={theme.colorHover.val}>
                        Total spent
                      </Text>
                    </RNView>
                  </RNView>
                </View>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Empty state */}
        {categories.length === 0 && (
          <View 
            padding="$6" 
            borderRadius="$6" 
            backgroundColor={theme.backgroundHover.val}
            borderWidth={1}
            borderColor={theme.borderColor.val}
            alignItems="center"
            justifyContent="center"
            minHeight={200}
          >
            <Ionicons name="pricetag-outline" size={48} color={theme.colorHover.val} />
            <Text fontSize="$5" fontWeight="600" color={theme.color.val} marginTop="$4">
              No Categories Found
            </Text>
            <Text fontSize="$3" color={theme.colorHover.val} textAlign="center" marginTop="$2">
              Categories will appear here once you add your first expense.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CategoriesScreen; 