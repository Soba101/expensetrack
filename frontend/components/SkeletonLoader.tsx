import React from 'react';
import { View, useTheme } from '@tamagui/core';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

// Individual skeleton item with shimmer animation
const SkeletonItem: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  marginBottom = 8 
}) => {
  const theme = useTheme();
  const shimmer = useSharedValue(0);

  // Shimmer animation
  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { 
        duration: 1500, 
        easing: Easing.inOut(Easing.ease) 
      }),
      -1,
      false
    );
  }, []);

  // Animated shimmer style
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.7, 0.3]
    );

    return {
      opacity,
    };
  });

  return (
    <View
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor={theme.color3?.val || '#E5E7EB'}
      marginBottom={marginBottom}
      overflow="hidden"
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: theme.color6?.val || '#F3F4F6',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// Expense item skeleton
export const ExpenseItemSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <View
      padding="$4"
      backgroundColor={theme.backgroundHover.val}
      borderRadius="$6"
      borderWidth={1}
      borderColor={theme.borderColor.val}
      marginBottom="$3"
    >
      <View flexDirection="row" gap="$3" alignItems="flex-start">
        {/* Icon skeleton */}
        <SkeletonItem width={40} height={40} borderRadius={20} marginBottom={0} />
        
        {/* Content skeleton */}
        <View flex={1} gap="$2">
          <SkeletonItem width="70%" height={16} marginBottom={4} />
          <SkeletonItem width="50%" height={12} marginBottom={4} />
          <SkeletonItem width="30%" height={12} marginBottom={0} />
        </View>
        
        {/* Amount skeleton */}
        <View alignItems="flex-end">
          <SkeletonItem width={60} height={20} marginBottom={4} />
          <SkeletonItem width={40} height={12} marginBottom={0} />
        </View>
      </View>
    </View>
  );
};

// Transaction list skeleton
export const TransactionListSkeleton: React.FC = () => {
  return (
    <View>
      {[...Array(5)].map((_, index) => (
        <ExpenseItemSkeleton key={index} />
      ))}
    </View>
  );
};

// Dashboard card skeleton
export const DashboardCardSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <View
      padding="$5"
      backgroundColor={theme.backgroundHover.val}
      borderRadius="$6"
      borderWidth={1}
      borderColor={theme.borderColor.val}
      marginBottom="$4"
    >
      <SkeletonItem width="60%" height={24} marginBottom={16} />
      <SkeletonItem width="100%" height={60} marginBottom={12} />
      <SkeletonItem width="80%" height={16} marginBottom={8} />
      <SkeletonItem width="90%" height={16} marginBottom={0} />
    </View>
  );
};

// Quick actions skeleton
export const QuickActionsSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <View
      padding="$5"
      backgroundColor={theme.backgroundHover.val}
      borderRadius="$6"
      borderWidth={1}
      borderColor={theme.borderColor.val}
      marginBottom="$4"
    >
      <SkeletonItem width="40%" height={20} marginBottom={16} />
      
      {/* 2x2 grid skeleton */}
      <View gap="$3">
        <View flexDirection="row" gap="$3">
          <View flex={1} alignItems="center" padding="$4">
            <SkeletonItem width={48} height={48} borderRadius={24} marginBottom={8} />
            <SkeletonItem width="80%" height={14} marginBottom={4} />
            <SkeletonItem width="60%" height={12} marginBottom={0} />
          </View>
          <View flex={1} alignItems="center" padding="$4">
            <SkeletonItem width={48} height={48} borderRadius={24} marginBottom={8} />
            <SkeletonItem width="80%" height={14} marginBottom={4} />
            <SkeletonItem width="60%" height={12} marginBottom={0} />
          </View>
        </View>
        
        <View flexDirection="row" gap="$3">
          <View flex={1} alignItems="center" padding="$4">
            <SkeletonItem width={48} height={48} borderRadius={24} marginBottom={8} />
            <SkeletonItem width="80%" height={14} marginBottom={4} />
            <SkeletonItem width="60%" height={12} marginBottom={0} />
          </View>
          <View flex={1} alignItems="center" padding="$4">
            <SkeletonItem width={48} height={48} borderRadius={24} marginBottom={8} />
            <SkeletonItem width="80%" height={14} marginBottom={4} />
            <SkeletonItem width="60%" height={12} marginBottom={0} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Full dashboard skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <View padding="$4">
      <DashboardCardSkeleton />
      <QuickActionsSkeleton />
      <DashboardCardSkeleton />
      <TransactionListSkeleton />
    </View>
  );
};

export default SkeletonItem; 