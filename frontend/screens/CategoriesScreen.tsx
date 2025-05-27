import React, { useState, useEffect } from 'react';
import { ScrollView, Box, VStack, HStack, Text, useColorModeValue, Icon, Pressable, Spinner, useToast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import * as expenseService from '../services/expenseService';

// CategoriesScreen: Shows and manages expense categories with real data
// Features: Dynamic category list, spending amounts per category, modern UI design
const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: { amount: number; count: number } }>({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
      toast.show({
        title: 'Error Loading Categories',
        description: 'Failed to load categories. Please try again.',
        duration: 3000,
      });
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

  // Theme-aware colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const primaryText = useColorModeValue('gray.900', 'gray.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('blue.50', 'blue.900');

  // Show loading state
  if (loading) {
    return (
      <ScrollView flex={1} bg={bg}>
        <Box p={4} pt={6}>
          <Box 
            p={6} 
            borderRadius={20} 
            bg={cardBg} 
            shadow={2}
            borderWidth={1}
            borderColor={border}
            alignItems="center"
            justifyContent="center"
            minH={300}
          >
            <Spinner size="lg" color="blue.500" />
            <Text mt={4} color={secondaryText}>
              Loading categories...
            </Text>
          </Box>
        </Box>
      </ScrollView>
    );
  }

  return (
    <ScrollView flex={1} bg={bg}>
      <Box p={4} pt={6}>
        {/* Header */}
        <Box 
          p={6} 
          borderRadius={20} 
          bg={headerBg} 
          shadow={3}
          borderWidth={1}
          borderColor={border}
          mb={6}
        >
          <VStack space={2}>
            <HStack alignItems="center" space={2}>
              <Icon as={Ionicons} name="pricetag" size="lg" color="blue.500" />
              <Text fontSize="2xl" fontWeight="bold" color={primaryText}>
                Expense Categories
              </Text>
            </HStack>
            <Text fontSize="md" color={secondaryText}>
              {categories.length} categories • {Object.values(categoryStats).reduce((sum, stat) => sum + stat.count, 0)} total expenses
            </Text>
          </VStack>
        </Box>

        {/* Categories List */}
        <VStack space={3}>
          {categories.map((category) => {
            const iconData = getCategoryIcon(category);
            const stats = categoryStats[category] || { amount: 0, count: 0 };
            
            return (
              <Pressable key={category}>
                <Box
                  p={4}
                  borderRadius={20}
                  bg={cardBg}
                  shadow={2}
                  borderWidth={1}
                  borderColor={border}
                >
                  <HStack alignItems="center" space={4}>
                    {/* Category Icon */}
                    <Box
                      p={3}
                      bg={iconData.bg}
                      borderRadius={20}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon
                        as={Ionicons}
                        name={iconData.icon as keyof typeof Ionicons.glyphMap}
                        size="md"
                        color={iconData.color}
                      />
                    </Box>

                    {/* Category Info */}
                    <VStack flex={1} space={1}>
                      <Text fontSize="lg" fontWeight="semibold" color={primaryText}>
                        {category}
                      </Text>
                      <Text fontSize="sm" color={secondaryText}>
                        {stats.count} {stats.count === 1 ? 'expense' : 'expenses'}
                      </Text>
                    </VStack>

                    {/* Amount */}
                    <VStack alignItems="flex-end" space={1}>
                      <Text fontSize="xl" fontWeight="bold" color={primaryText}>
                        ${stats.amount.toFixed(2)}
                      </Text>
                      <Text fontSize="xs" color={secondaryText}>
                        Total spent
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </Pressable>
            );
          })}
        </VStack>

        {/* Empty state */}
        {categories.length === 0 && (
          <Box 
            p={6} 
            borderRadius={20} 
            bg={cardBg} 
            shadow={2}
            borderWidth={1}
            borderColor={border}
            alignItems="center"
            justifyContent="center"
            minH={200}
          >
            <Icon as={Ionicons} name="pricetag-outline" size="xl" color={secondaryText} />
            <Text mt={4} color={secondaryText} textAlign="center" fontSize="md">
              No categories yet
            </Text>
            <Text mt={2} color={secondaryText} textAlign="center" fontSize="sm">
              Categories will appear as you add expenses
            </Text>
          </Box>
        )}

        {/* Footer spacing */}
        <Box h={6} />
      </Box>
    </ScrollView>
  );
};

export default CategoriesScreen; 