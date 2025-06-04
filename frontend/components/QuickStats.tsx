import React from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseData } from '../context/ExpenseDataContext';

// QuickStats component displays key financial metrics in attractive cards
// Features: Daily average, top category, spending streak, budget health
const QuickStats: React.FC = () => {
  const { summaryData, loading } = useExpenseData();
  const theme = useTheme();

  // Theme colors
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';

  // Show skeleton loading state
  if (loading || !summaryData) {
    return (
      <View marginBottom="$4">
        <Text fontSize="$5" fontWeight="600" color={primaryText} marginBottom="$3">
          Quick Stats
        </Text>
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
          {[1, 2].map((i) => (
            <View
              key={i}
              flex={1}
              padding="$4"
              borderRadius="$5"
              backgroundColor={cardBg}
              borderWidth={1}
              borderColor={border}
              minHeight={100}
            >
              <View
                height={20}
                backgroundColor="#E5E7EB"
                borderRadius="$2"
                marginBottom="$2"
              />
              <View
                height={32}
                backgroundColor="#E5E7EB"
                borderRadius="$2"
                marginBottom="$2"
              />
              <View
                height={16}
                width="60%"
                backgroundColor="#E5E7EB"
                borderRadius="$2"
              />
            </View>
          ))}
        </RNView>
      </View>
    );
  }

  const { currentMonth, categories } = summaryData;

  // Calculate key metrics
  const dailyAverage = currentMonth.spent / new Date().getDate();
  const topCategory = categories.length > 0 ? categories[0] : null;
  const budgetHealth = ((currentMonth.budget - currentMonth.spent) / currentMonth.budget) * 100;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - new Date().getDate();

  // Get health color based on budget status
  const getHealthColor = () => {
    if (budgetHealth > 50) return '#10B981'; // Green
    if (budgetHealth > 20) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Get health icon based on budget status
  const getHealthIcon = () => {
    if (budgetHealth > 50) return 'checkmark-circle';
    if (budgetHealth > 20) return 'warning';
    return 'alert-circle';
  };

  const stats = [
    {
      id: 'daily',
      title: 'Daily Average',
      value: `$${dailyAverage.toFixed(0)}`,
      subtitle: `${daysRemaining} days left`,
      icon: 'calendar',
      color: '#3B82F6',
      bgColor: '#EBF8FF',
    },
    {
      id: 'health',
      title: 'Budget Health',
      value: `${Math.max(0, budgetHealth).toFixed(0)}%`,
      subtitle: budgetHealth > 0 ? 'On track' : 'Over budget',
      icon: getHealthIcon(),
      color: getHealthColor(),
      bgColor: budgetHealth > 50 ? '#D1FAE5' : budgetHealth > 20 ? '#FEF3C7' : '#FEE2E2',
    },
  ];

  // Add top category stat if available
  if (topCategory) {
    stats.push({
      id: 'top',
      title: 'Top Category',
      value: topCategory.name,
      subtitle: `$${topCategory.amount.toFixed(0)} spent`,
      icon: 'trending-up',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    });
  }

  return (
    <View marginBottom="$4">
      <Text fontSize="$5" fontWeight="600" color={primaryText} marginBottom="$3">
        Quick Stats
      </Text>
      
      <RNView style={{ flexDirection: 'row', gap: 12 }}>
        {stats.slice(0, 2).map((stat) => (
          <TouchableOpacity key={stat.id} style={{ flex: 1 }}>
            <View
              padding="$4"
              borderRadius="$5"
              backgroundColor={cardBg}
              borderWidth={1}
              borderColor={border}
              minHeight={100}
            >
              {/* Icon */}
              <View
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={stat.bgColor}
                alignItems="center"
                justifyContent="center"
                marginBottom="$3"
              >
                <Ionicons
                  name={stat.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={stat.color}
                />
              </View>

              {/* Content */}
              <RNView style={{ gap: 4 }}>
                <Text fontSize="$2" color={secondaryText} fontWeight="500">
                  {stat.title}
                </Text>
                <Text fontSize="$5" fontWeight="700" color={primaryText}>
                  {stat.value}
                </Text>
                <Text fontSize="$2" color={secondaryText}>
                  {stat.subtitle}
                </Text>
              </RNView>
            </View>
          </TouchableOpacity>
        ))}
      </RNView>

      {/* Third stat (top category) in full width if available */}
      {topCategory && (
        <TouchableOpacity style={{ marginTop: 12 }}>
          <View
            padding="$4"
            borderRadius="$5"
            backgroundColor={cardBg}
            borderWidth={1}
            borderColor={border}
          >
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={stats[2].bgColor}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name={stats[2].icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={stats[2].color}
                />
              </View>

              <RNView style={{ flex: 1, gap: 2 }}>
                <Text fontSize="$3" color={secondaryText} fontWeight="500">
                  {stats[2].title}
                </Text>
                <Text fontSize="$4" fontWeight="600" color={primaryText}>
                  {stats[2].value}
                </Text>
                <Text fontSize="$2" color={secondaryText}>
                  {stats[2].subtitle}
                </Text>
              </RNView>

              <Ionicons name="chevron-forward" size={16} color={secondaryText} />
            </RNView>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default QuickStats; 