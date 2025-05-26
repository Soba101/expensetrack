import React from 'react';
import { Box, Text, VStack, HStack, useColorModeValue, Circle, Badge } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

// SmartInsights component with Apple-style design
// Features: Personalized insights, clean typography, contextual information, elegant layout
const SmartInsights = () => {
  // Mock intelligent insights based on spending patterns
  const insights = [
    {
      id: 1,
      type: 'positive',
      icon: 'trending-down',
      title: 'Great Progress!',
      description: 'You\'ve spent 23% less on dining this month compared to last month.',
      action: 'Keep it up',
      color: 'green'
    },
    {
      id: 2,
      type: 'warning',
      icon: 'alert-circle',
      title: 'Budget Alert',
      description: 'You\'re 80% through your monthly budget with 10 days remaining.',
      action: 'Review spending',
      color: 'orange'
    },
    {
      id: 3,
      type: 'info',
      icon: 'calendar',
      title: 'Spending Pattern',
      description: 'You typically spend 40% more on weekends. Consider planning ahead.',
      action: 'Set weekend budget',
      color: 'blue'
    }
  ];

  // Apple-style colors with semantic meaning
  const cardBg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('coolGray.100', 'gray.700');
  const primaryText = useColorModeValue('gray.900', 'gray.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  
  // Insight colors
  const getInsightColors = (color: string) => {
    const colors = {
      green: {
        bg: useColorModeValue('green.50', 'green.900'),
        border: useColorModeValue('green.200', 'green.700'),
        icon: useColorModeValue('green.500', 'green.400'),
        badge: 'green'
      },
      orange: {
        bg: useColorModeValue('orange.50', 'orange.900'),
        border: useColorModeValue('orange.200', 'orange.700'),
        icon: useColorModeValue('orange.500', 'orange.400'),
        badge: 'orange'
      },
      blue: {
        bg: useColorModeValue('blue.50', 'blue.900'),
        border: useColorModeValue('blue.200', 'blue.700'),
        icon: useColorModeValue('blue.500', 'blue.400'),
        badge: 'blue'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Individual insight card component
  const InsightCard = ({ insight }: { insight: typeof insights[0] }) => {
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
            bg={useColorModeValue('white', 'gray.800')}
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
        bg={useColorModeValue('gray.50', 'gray.800')}
        borderWidth={1}
        borderColor={border}
      >
        <HStack alignItems="center" space={2}>
          <Ionicons 
            name="bulb" 
            size={16} 
            color={useColorModeValue('#6b7280', '#9ca3af')} 
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