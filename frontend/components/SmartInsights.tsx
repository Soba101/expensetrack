import React, { useState, useEffect } from 'react';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
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

  // Using Tamagui theme instead of useColorModeValue - following migration guide Pattern 2
  const theme = useTheme();
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  
  // Insight colors - using fixed colors for consistency
  const greenBg = '#F0FDF4';
  const greenBorder = '#BBF7D0';
  const greenIcon = '#10B981';
  const orangeBg = '#FFFBEB';
  const orangeBorder = '#FED7AA';
  const orangeIcon = '#F59E0B';
  const blueBg = '#EFF6FF';
  const blueBorder = '#DBEAFE';
  const blueIcon = '#3B82F6';
  const iconBg = theme.background.val;
  const footerBg = theme.backgroundHover.val;
  const footerIconColor = '#6B7280';

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
      <View
        padding="$4"
        borderRadius="$5"
        backgroundColor={colors.bg}
        borderWidth={1}
        borderColor={colors.border}
      >
        <RNView style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          {/* Icon with background */}
          <View
            padding="$2"
            borderRadius="$5"
            backgroundColor={iconBg}
          >
            <Ionicons 
              name={insight.icon as any} 
              size={20} 
              color={colors.icon} 
            />
          </View>

          {/* Content */}
          <RNView style={{ flex: 1, gap: 8 }}>
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text 
                fontSize="$4" 
                fontWeight="600" 
                color={primaryText}
              >
                {insight.title}
              </Text>
              <View backgroundColor={colors.bg} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                <Text fontSize="$2" color={colors.icon} fontWeight="500">
                  {insight.action}
                </Text>
              </View>
            </RNView>
            
            <Text 
              fontSize="$3" 
              color={secondaryText}
              lineHeight="$1"
            >
              {insight.description}
            </Text>
          </RNView>
        </RNView>
      </View>
    );
  };

  // Show loading state
  if (dataLoading || insightsLoading) {
    return (
      <View marginBottom="$6">
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
          <Text fontSize="$5" fontWeight="600" color={primaryText}>
            Smart Insights
          </Text>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View width={8} height={8} borderRadius="$2" backgroundColor="#10B981" />
            <Text fontSize="$2" color={secondaryText} fontWeight="500">
              AI-powered
            </Text>
          </RNView>
        </RNView>
        
        <View
          padding="$6"
          borderRadius="$5"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
          alignItems="center"
          justifyContent="center"
          minHeight={120}
        >
          <Text color="#3B82F6">Analyzing...</Text>
          <Text marginTop="$2" fontSize="$3" color={secondaryText}>
            Analyzing your spending...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View marginBottom="$6">
      {/* Section Header - Apple's clean typography */}
      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
        <Text 
          fontSize="$5" 
          fontWeight="600" 
          color={primaryText}
        >
          Smart Insights
        </Text>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View width={8} height={8} borderRadius="$2" backgroundColor="#10B981" />
          <Text fontSize="$2" color={secondaryText} fontWeight="500">
            AI-powered
          </Text>
        </RNView>
      </RNView>

      {/* Insights List - Apple's clean, scannable layout */}
      <RNView style={{ gap: 12 }}>
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </RNView>

      {/* Footer with helpful tip - Apple's progressive disclosure */}
      <View
        marginTop="$4"
        padding="$3"
        borderRadius="$5"
        backgroundColor={footerBg}
        borderWidth={1}
        borderColor={border}
      >
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons 
            name="bulb" 
            size={16} 
            color={footerIconColor} 
          />
          <Text fontSize="$2" color={secondaryText} flex={1}>
            Insights update daily based on your spending patterns and goals.
          </Text>
        </RNView>
      </View>
    </View>
  );
};

export default SmartInsights; 