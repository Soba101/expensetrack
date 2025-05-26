import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, useColorModeValue, Circle, Badge, Spinner } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseData } from '../context/ExpenseDataContext';

// Interface for insights
interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  icon: string;
  title: string;
  description: string;
  action: string;
  color: 'green' | 'orange' | 'blue';
}

// SmartInsights component with Apple-style design and real data
// Features: Personalized insights, clean typography, contextual information, elegant layout, AI-powered analysis
const SmartInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  
  // Use centralized data context
  const { summaryData, expenses, loading: dataLoading } = useExpenseData();
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Apple-style colors with semantic meaning - MOVED TO TOP to fix hooks order
  const cardBg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('coolGray.100', 'gray.700');
  const primaryText = useColorModeValue('gray.900', 'gray.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  
  // Insight colors - all defined at top to maintain hook order
  const greenBg = useColorModeValue('green.50', 'green.900');
  const greenBorder = useColorModeValue('green.200', 'green.700');
  const greenIcon = useColorModeValue('green.500', 'green.400');
  const orangeBg = useColorModeValue('orange.50', 'orange.900');
  const orangeBorder = useColorModeValue('orange.200', 'orange.700');
  const orangeIcon = useColorModeValue('orange.500', 'orange.400');
  const blueBg = useColorModeValue('blue.50', 'blue.900');
  const blueBorder = useColorModeValue('blue.200', 'blue.700');
  const blueIcon = useColorModeValue('blue.500', 'blue.400');
  const iconBg = useColorModeValue('white', 'gray.800');
  const footerBg = useColorModeValue('gray.50', 'gray.800');
  const footerIconColor = useColorModeValue('#6b7280', '#9ca3af');

  // Generate insights when data is available
  useEffect(() => {
    if (summaryData && expenses.length > 0 && !dataLoading) {
      generateInsights();
    }
  }, [summaryData, expenses, dataLoading]);

  const generateInsights = async () => {
    try {
      setInsightsLoading(true);
      
      if (!summaryData) {
        throw new Error('No summary data available');
      }

      const generatedInsights: Insight[] = [];

      // Insight 1: Budget progress analysis
      const budgetProgress = (summaryData.currentMonth.spent / summaryData.currentMonth.budget) * 100;
      const daysRemaining = summaryData.currentMonth.daysInMonth - summaryData.currentMonth.daysPassed;
      
      if (budgetProgress > 90) {
        generatedInsights.push({
          id: 'budget-alert',
          type: 'warning',
          icon: 'alert-circle',
          title: 'Budget Alert',
          description: `You've used ${budgetProgress.toFixed(0)}% of your monthly budget with ${daysRemaining} days remaining.`,
          action: 'Review spending',
          color: 'orange'
        });
      } else if (budgetProgress < 50 && summaryData.currentMonth.daysPassed > 15) {
        generatedInsights.push({
          id: 'budget-good',
          type: 'positive',
          icon: 'checkmark-circle',
          title: 'Great Progress!',
          description: `You're only at ${budgetProgress.toFixed(0)}% of your budget. You're on track for a great month!`,
          action: 'Keep it up',
          color: 'green'
        });
      }

      // Insight 2: Spending trend analysis
      const monthlyTrend = summaryData.currentMonth.lastMonth > 0 
        ? ((summaryData.currentMonth.spent - summaryData.currentMonth.lastMonth) / summaryData.currentMonth.lastMonth * 100)
        : 0;

      if (monthlyTrend < -10) {
        generatedInsights.push({
          id: 'spending-down',
          type: 'positive',
          icon: 'trending-down',
          title: 'Spending Reduced',
          description: `You've spent ${Math.abs(monthlyTrend).toFixed(0)}% less this month compared to last month. Excellent progress!`,
          action: 'Maintain trend',
          color: 'green'
        });
      } else if (monthlyTrend > 20) {
        generatedInsights.push({
          id: 'spending-up',
          type: 'warning',
          icon: 'trending-up',
          title: 'Increased Spending',
          description: `Your spending is up ${monthlyTrend.toFixed(0)}% from last month. Consider reviewing your expenses.`,
          action: 'Review categories',
          color: 'orange'
        });
      }

      // Insight 3: Category analysis
      const topCategory = summaryData.categories[0];
      if (topCategory && summaryData.categories.length > 1) {
        const categoryPercentage = (topCategory.amount / summaryData.currentMonth.spent) * 100;
        if (categoryPercentage > 40) {
          generatedInsights.push({
            id: 'category-dominant',
            type: 'info',
            icon: 'pie-chart',
            title: 'Category Focus',
            description: `${topCategory.name} accounts for ${categoryPercentage.toFixed(0)}% of your spending. Consider setting a specific budget for this category.`,
            action: 'Set category budget',
            color: 'blue'
          });
        }
      }

      // Insight 4: Projection analysis
      if (summaryData.currentMonth.projectedSpending > summaryData.currentMonth.budget * 1.1) {
        generatedInsights.push({
          id: 'projection-warning',
          type: 'warning',
          icon: 'calculator',
          title: 'Projection Alert',
          description: `At your current pace, you're projected to spend $${summaryData.currentMonth.projectedSpending.toFixed(0)} this month.`,
          action: 'Adjust spending',
          color: 'orange'
        });
      } else if (summaryData.currentMonth.projectedSpending < summaryData.currentMonth.budget * 0.9) {
        generatedInsights.push({
          id: 'projection-good',
          type: 'positive',
          icon: 'calculator',
          title: 'On Track',
          description: `You're projected to spend $${summaryData.currentMonth.projectedSpending.toFixed(0)}, staying well within your budget.`,
          action: 'Great job',
          color: 'green'
        });
      }

      // Insight 5: Recent activity analysis
      const recentExpenses = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return expenseDate >= threeDaysAgo;
        });

      if (recentExpenses.length === 0) {
        generatedInsights.push({
          id: 'no-recent',
          type: 'info',
          icon: 'time',
          title: 'Quiet Period',
          description: 'No expenses recorded in the last 3 days. Don\'t forget to track your spending!',
          action: 'Add expenses',
          color: 'blue'
        });
      } else if (recentExpenses.length > 10) {
        generatedInsights.push({
          id: 'high-activity',
          type: 'info',
          icon: 'flash',
          title: 'High Activity',
          description: `${recentExpenses.length} expenses in the last 3 days. You're actively tracking your spending!`,
          action: 'Review patterns',
          color: 'blue'
        });
      }

      // Limit to top 3 insights
      setInsights(generatedInsights.slice(0, 3));
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Fallback to a default insight
      setInsights([{
        id: 'default',
        type: 'info',
        icon: 'information-circle',
        title: 'Welcome to ExpenseTrack',
        description: 'Start adding expenses to get personalized insights about your spending patterns.',
        action: 'Add expense',
        color: 'blue'
      }]);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Insight colors
  const getInsightColors = (color: string) => {
    const colors = {
      green: {
        bg: greenBg,
        border: greenBorder,
        icon: greenIcon,
        badge: 'green'
      },
      orange: {
        bg: orangeBg,
        border: orangeBorder,
        icon: orangeIcon,
        badge: 'orange'
      },
      blue: {
        bg: blueBg,
        border: blueBorder,
        icon: blueIcon,
        badge: 'blue'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Individual insight card component
  const InsightCard = ({ insight }: { insight: Insight }) => {
    const colors = getInsightColors(insight.color);
    
    return (
      <Box
        p={4}
        borderRadius={16}
        bg={colors.bg}
        borderWidth={1}
        borderColor={colors.border}
        shadow={1}
      >
        <HStack space={3} alignItems="flex-start">
          {/* Icon with background */}
          <Box
            p={2}
            borderRadius={12}
            bg={iconBg}
            shadow={1}
          >
            <Ionicons 
              name={insight.icon as any} 
              size={20} 
              color={colors.icon} 
            />
          </Box>

          {/* Content */}
          <VStack flex={1} space={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text 
                fontSize="md" 
                fontWeight="600" 
                color={primaryText}
              >
                {insight.title}
              </Text>
              <Badge 
                colorScheme={colors.badge} 
                borderRadius={8}
                _text={{ fontSize: 'xs', fontWeight: '500' }}
              >
                {insight.action}
              </Badge>
            </HStack>
            
            <Text 
              fontSize="sm" 
              color={secondaryText}
              lineHeight="md"
            >
              {insight.description}
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  };

  // Show loading state
  if (dataLoading || insightsLoading) {
    return (
      <Box mb={6}>
        <HStack justifyContent="space-between" alignItems="center" mb={4} px={1}>
          <Text fontSize="lg" fontWeight="600" color={primaryText}>
            Smart Insights
          </Text>
          <HStack alignItems="center" space={1}>
            <Circle size={2} bg="green.400" />
            <Text fontSize="xs" color={secondaryText} fontWeight="500">
              AI-powered
            </Text>
          </HStack>
        </HStack>
        
        <Box
          p={6}
          borderRadius={16}
          bg={cardBg}
          borderWidth={1}
          borderColor={border}
          alignItems="center"
          justifyContent="center"
          minH={120}
        >
          <Spinner size="sm" color="blue.500" />
          <Text mt={2} fontSize="sm" color={secondaryText}>
            Analyzing your spending...
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box mb={6}>
      {/* Section Header - Apple's clean typography */}
      <HStack justifyContent="space-between" alignItems="center" mb={4} px={1}>
        <Text 
          fontSize="lg" 
          fontWeight="600" 
          color={primaryText}
        >
          Smart Insights
        </Text>
        <HStack alignItems="center" space={1}>
          <Circle size={2} bg="green.400" />
          <Text fontSize="xs" color={secondaryText} fontWeight="500">
            AI-powered
          </Text>
        </HStack>
      </HStack>

      {/* Insights List - Apple's clean, scannable layout */}
      <VStack space={3}>
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </VStack>

      {/* Footer with helpful tip - Apple's progressive disclosure */}
      <Box
        mt={4}
        p={3}
        borderRadius={12}
        bg={footerBg}
        borderWidth={1}
        borderColor={border}
      >
        <HStack alignItems="center" space={2}>
          <Ionicons 
            name="bulb" 
            size={16} 
            color={footerIconColor} 
          />
          <Text fontSize="xs" color={secondaryText} flex={1}>
            Insights update daily based on your spending patterns and goals.
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default SmartInsights; 