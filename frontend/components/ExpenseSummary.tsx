import React, { useState } from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseData } from '../context/ExpenseDataContext';

// ExpenseSummary component displays spending overview with integrated breakdown
// Features: Hero card layout, trend indicators, budget progress, category breakdown, real data from API
const ExpenseSummary = () => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Use centralized data context instead of individual API calls
  const { summaryData, loading, error } = useExpenseData();

  // Using Tamagui theme instead of useColorModeValue - following migration guide Pattern 2
  const theme = useTheme();
  const cardBg = theme.backgroundHover.val;
  const heroCardBg = '#3B82F6'; // Blue background for hero card
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  const accentColor = '#3B82F6';
  const successColor = '#10B981';
  const warningColor = '#F59E0B';
  const dangerColor = '#EF4444';
  // Error state colors
  const errorBg = '#FEF2F2';
  const errorBorder = '#FECACA';
  const errorText = '#DC2626';
  // Progress bar background
  const progressBg = '#E5E7EB';
  // Category toggle background
  const toggleBg = theme.background.val;
  // Smart insight background
  const insightBg = theme.background.val;

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <View 
        padding="$6" 
        borderRadius="$6" 
        backgroundColor={heroCardBg} 
        marginBottom="$6"
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Text color="white">Loading...</Text>
        <Text marginTop="$4" color="rgba(255,255,255,0.8)">
          Loading expense data...
        </Text>
      </View>
    );
  }

  // Show error state if data failed to load
  if (!summaryData) {
    return (
      <View 
        padding="$6" 
        borderRadius="$6" 
        backgroundColor={errorBg} 
        borderWidth={1}
        borderColor={errorBorder}
        marginBottom="$6"
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Ionicons name="alert-circle" size={40} color="#EF4444" />
        <Text marginTop="$4" color={errorText} textAlign="center">
          Failed to load expense data
        </Text>
        <Text color={accentColor} fontWeight="500">Please check your connection</Text>
      </View>
    );
  }

  const { currentMonth, yearData, categories } = summaryData;

  // Calculate trend and progress using real data
  const monthlyTrend = currentMonth.lastMonth > 0 
    ? ((currentMonth.spent - currentMonth.lastMonth) / currentMonth.lastMonth * 100)
    : 0;
  const budgetProgress = (currentMonth.spent / currentMonth.budget) * 100;
  const isOverBudget = budgetProgress > 100;
  const isOnTrack = currentMonth.projectedSpending <= currentMonth.budget;

  // Determine trend color and icon
  const getTrendColor = () => {
    if (monthlyTrend > 10) return dangerColor;
    if (monthlyTrend > 0) return warningColor;
    return successColor;
  };

  const getTrendIcon = () => {
    if (monthlyTrend > 5) return 'trending-up';
    if (monthlyTrend < -5) return 'trending-down';
    return 'remove';
  };

  return (
    <RNView style={{ gap: 16, marginBottom: 24 }}>
      {/* Hero Card - Main Monthly Overview with Integrated Breakdown */}
      <View 
        padding="$6" 
        borderRadius="$6" 
        backgroundColor={heroCardBg} 
        borderWidth={1}
        borderColor={border}
      >
        {/* Header with period and trend */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text fontSize="$5" fontWeight="600" color="rgba(255,255,255,0.8)">
            This Month
          </Text>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons 
              name={getTrendIcon()} 
              size={16} 
              color={getTrendColor()} 
            />
            <Text 
              fontSize="$3" 
              fontWeight="600" 
              color={getTrendColor()}
            >
              {monthlyTrend > 0 ? '+' : ''}{monthlyTrend.toFixed(1)}%
            </Text>
          </RNView>
        </RNView>

        {/* Main spending amount - Apple's large, bold typography */}
        <RNView style={{ gap: 8, marginBottom: 16 }}>
          <Text 
            fontSize="$10" 
            fontWeight="700" 
            color="white"
          >
            ${currentMonth.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text fontSize="$4" color="rgba(255,255,255,0.8)">
            of ${currentMonth.budget.toLocaleString()} budget
          </Text>
        </RNView>

        {/* Budget Progress Bar - Simple implementation */}
        <RNView style={{ gap: 8, marginBottom: 16 }}>
          <View 
            height={8}
            backgroundColor={progressBg}
            borderRadius="$2"
            overflow="hidden"
          >
            <View 
              height="100%"
              width={`${Math.min(budgetProgress, 100)}%`}
              backgroundColor={isOverBudget ? dangerColor : budgetProgress > 80 ? warningColor : accentColor}
            />
          </View>
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text fontSize="$3" color="rgba(255,255,255,0.8)">
              {budgetProgress.toFixed(0)}% used
            </Text>
            <Text fontSize="$3" color="rgba(255,255,255,0.8)">
              ${(currentMonth.budget - currentMonth.spent).toFixed(0)} remaining
            </Text>
          </RNView>
        </RNView>

        {/* Category Breakdown Toggle */}
        {categories.length > 0 && (
          <TouchableOpacity onPress={() => setShowBreakdown(!showBreakdown)}>
            <View 
              padding="$3"
              borderRadius="$5"
              backgroundColor={toggleBg}
              borderWidth={1}
              borderColor={border}
            >
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  Category Breakdown ({categories.length} categories)
                </Text>
                <Ionicons 
                  name={showBreakdown ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={secondaryText} 
                />
              </RNView>
            </View>
          </TouchableOpacity>
        )}

        {/* Expandable Category Breakdown */}
        {showBreakdown && categories.length > 0 && (
          <RNView style={{ gap: 8, marginTop: 12 }}>
            {categories.map((cat, idx) => (
              <RNView key={cat.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View width={12} height={12} borderRadius="$6" backgroundColor={cat.color} />
                  <Text color={primaryText} fontWeight="500" fontSize="$3">
                    {cat.name}
                  </Text>
                </RNView>
                <Text color={primaryText} fontWeight="600" fontSize="$3">
                  ${cat.amount.toFixed(2)}
                </Text>
              </RNView>
            ))}
          </RNView>
        )}

        {/* Smart Insight - Apple's helpful, contextual information */}
        <View 
          padding="$3" 
          borderRadius="$5" 
          backgroundColor={insightBg}
          borderWidth={1}
          borderColor={border}
          marginTop="$3"
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View width={8} height={8} borderRadius="$2" backgroundColor={isOnTrack ? successColor : warningColor} />
            <Text fontSize="$3" color={primaryText} flex={1}>
              {isOnTrack 
                ? `On track to spend $${currentMonth.projectedSpending.toFixed(0)} this month`
                : `Projected to exceed budget by $${(currentMonth.projectedSpending - currentMonth.budget).toFixed(0)}`
              }
            </Text>
          </RNView>
        </View>
      </View>

      {/* Secondary Stats - Clean, minimal cards */}
      <RNView style={{ flexDirection: 'row', gap: 16 }}>
        {/* Year Progress */}
        <View 
          flex={1}
          padding="$4" 
          borderRadius="$5" 
          backgroundColor={cardBg} 
          borderWidth={1}
          borderColor={border}
        >
          <RNView style={{ gap: 8 }}>
            <Text fontSize="$3" fontWeight="600" color={secondaryText}>
              This Year
            </Text>
            <Text fontSize="$7" fontWeight="700" color={primaryText}>
              ${yearData.spent.toLocaleString()}
            </Text>
            <Text fontSize="$2" color={secondaryText}>
              of ${yearData.target.toLocaleString()} target
            </Text>
          </RNView>
        </View>

        {/* Daily Average */}
        <View 
          flex={1}
          padding="$4" 
          borderRadius="$5" 
          backgroundColor={cardBg} 
          borderWidth={1}
          borderColor={border}
        >
          <RNView style={{ gap: 8 }}>
            <Text fontSize="$3" fontWeight="600" color={secondaryText}>
              Daily Avg
            </Text>
            <Text fontSize="$7" fontWeight="700" color={primaryText}>
              ${currentMonth.dailyAverage.toFixed(0)}
            </Text>
            <Text fontSize="$2" color={secondaryText}>
              last {currentMonth.daysPassed} days
            </Text>
          </RNView>
        </View>
      </RNView>
    </RNView>
  );
};

export default ExpenseSummary; 