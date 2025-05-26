import React, { useState } from 'react';
import { Box, Text, VStack, HStack, useColorModeValue, Progress, Circle, Pressable, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

// ExpenseSummary component displays spending overview with integrated breakdown
// Features: Hero card layout, trend indicators, budget progress, category breakdown
const ExpenseSummary = () => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Mock data with trends and budget info
  const currentMonth = {
    spent: 1200.50,
    budget: 1500.00,
    lastMonth: 1350.75,
    dailyAverage: 40.02,
    daysInMonth: 30,
    daysPassed: 15,
    projectedSpending: 1200.60
  };

  const yearData = {
    spent: 8500.75,
    target: 15000.00
  };

  // Category breakdown data (integrated from ExpenseBreakdown)
  const categories = [
    { name: 'Food', amount: 400, color: 'blue.400' },
    { name: 'Utilities', amount: 200, color: 'teal.400' },
    { name: 'Transport', amount: 150, color: 'orange.400' },
    { name: 'Other', amount: 100, color: 'gray.400' },
  ];

  // Calculate trend and progress
  const monthlyTrend = ((currentMonth.spent - currentMonth.lastMonth) / currentMonth.lastMonth * 100);
  const budgetProgress = (currentMonth.spent / currentMonth.budget) * 100;
  const isOverBudget = budgetProgress > 100;
  const isOnTrack = currentMonth.projectedSpending <= currentMonth.budget;

  // Apple-style colors with semantic meaning
  const cardBg = useColorModeValue('white', 'gray.900');
  const heroCardBg = useColorModeValue('blue.50', 'blue.900');
  const border = useColorModeValue('coolGray.100', 'gray.700');
  const primaryText = useColorModeValue('gray.900', 'gray.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const successColor = useColorModeValue('green.500', 'green.400');
  const warningColor = useColorModeValue('orange.500', 'orange.400');
  const dangerColor = useColorModeValue('red.500', 'red.400');

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
    <VStack space={4} mb={6}>
      {/* Hero Card - Main Monthly Overview with Integrated Breakdown */}
      <Box 
        p={6} 
        borderRadius={24} 
        bg={heroCardBg} 
        shadow={3}
        borderWidth={1}
        borderColor={border}
      >
        {/* Header with period and trend */}
        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="lg" fontWeight="600" color={secondaryText}>
            This Month
          </Text>
          <HStack alignItems="center" space={1}>
            <Ionicons 
              name={getTrendIcon()} 
              size={16} 
              color={getTrendColor()} 
            />
            <Text 
              fontSize="sm" 
              fontWeight="600" 
              color={getTrendColor()}
            >
              {monthlyTrend > 0 ? '+' : ''}{monthlyTrend.toFixed(1)}%
            </Text>
          </HStack>
        </HStack>

        {/* Main spending amount - Apple's large, bold typography */}
        <VStack space={2} mb={4}>
          <Text 
            fontSize="4xl" 
            fontWeight="700" 
            color={primaryText}
            letterSpacing="-1"
          >
            ${currentMonth.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text fontSize="md" color={secondaryText}>
            of ${currentMonth.budget.toLocaleString()} budget
          </Text>
        </VStack>

        {/* Budget Progress Bar - Apple-style with semantic colors */}
        <VStack space={2} mb={4}>
          <Progress 
            value={Math.min(budgetProgress, 100)} 
            colorScheme={isOverBudget ? "red" : budgetProgress > 80 ? "orange" : "blue"}
            size="lg"
            borderRadius={8}
            bg={useColorModeValue('gray.200', 'gray.700')}
          />
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color={secondaryText}>
              {budgetProgress.toFixed(0)}% used
            </Text>
            <Text fontSize="sm" color={secondaryText}>
              ${(currentMonth.budget - currentMonth.spent).toFixed(0)} remaining
            </Text>
          </HStack>
        </VStack>

        {/* Category Breakdown Toggle */}
        <Pressable onPress={() => setShowBreakdown(!showBreakdown)}>
          <HStack 
            justifyContent="space-between" 
            alignItems="center"
            p={3}
            borderRadius={12}
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth={1}
            borderColor={border}
          >
            <Text fontSize="sm" fontWeight="600" color={primaryText}>
              Category Breakdown
            </Text>
            <Icon 
              as={Ionicons} 
              name={showBreakdown ? 'chevron-up' : 'chevron-down'} 
              size="sm" 
              color={secondaryText} 
            />
          </HStack>
        </Pressable>

        {/* Expandable Category Breakdown */}
        {showBreakdown && (
          <VStack space={2} mt={3}>
            {categories.map((cat, idx) => (
              <HStack key={cat.name} justifyContent="space-between" alignItems="center" space={2}>
                <HStack alignItems="center" space={2} flex={1}>
                  <Circle size={3} bg={cat.color} />
                  <Text color={primaryText} fontWeight="medium" fontSize="sm">
                    {cat.name}
                  </Text>
                </HStack>
                <Text color={primaryText} fontWeight="semibold" fontSize="sm">
                  ${cat.amount.toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}

        {/* Smart Insight - Apple's helpful, contextual information */}
        <Box 
          p={3} 
          borderRadius={12} 
          bg={useColorModeValue('white', 'gray.800')}
          borderWidth={1}
          borderColor={border}
          mt={3}
        >
          <HStack alignItems="center" space={2}>
            <Circle size={2} bg={isOnTrack ? successColor : warningColor} />
            <Text fontSize="sm" color={primaryText} flex={1}>
              {isOnTrack 
                ? `On track to spend $${currentMonth.projectedSpending.toFixed(0)} this month`
                : `Projected to exceed budget by $${(currentMonth.projectedSpending - currentMonth.budget).toFixed(0)}`
              }
            </Text>
          </HStack>
        </Box>
      </Box>

      {/* Secondary Stats - Clean, minimal cards */}
      <HStack space={4}>
        {/* Year Progress */}
        <Box 
          flex={1}
          p={4} 
          borderRadius={16} 
          bg={cardBg} 
          borderWidth={1}
          borderColor={border}
          shadow={1}
        >
          <Text fontSize="sm" fontWeight="600" color={secondaryText} mb={1}>
            This Year
          </Text>
          <Text fontSize="xl" fontWeight="700" color={primaryText}>
            ${yearData.spent.toLocaleString()}
          </Text>
          <Text fontSize="xs" color={secondaryText}>
            of ${yearData.target.toLocaleString()} target
          </Text>
        </Box>

        {/* Daily Average */}
        <Box 
          flex={1}
          p={4} 
          borderRadius={16} 
          bg={cardBg} 
          borderWidth={1}
          borderColor={border}
          shadow={1}
        >
          <Text fontSize="sm" fontWeight="600" color={secondaryText} mb={1}>
            Daily Avg
          </Text>
          <Text fontSize="xl" fontWeight="700" color={primaryText}>
            ${currentMonth.dailyAverage.toFixed(0)}
          </Text>
          <Text fontSize="xs" color={secondaryText}>
            past {currentMonth.daysPassed} days
          </Text>
        </Box>
      </HStack>
    </VStack>
  );
};

export default ExpenseSummary; 