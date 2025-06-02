import React, { useState } from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseData } from '../context/ExpenseDataContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  FadeInDown,
  FadeOutUp
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';

// Define the type for the navigation stack
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: undefined;
  ExpensesList: undefined;
  AddEditExpense: undefined;
  Categories: undefined;
  Reports: undefined;
  About: undefined;
};

// Enhanced RecentTransactions component with animations, gestures, and haptic feedback
// Features: Smooth animations, swipe actions, haptic feedback, improved interactions
const RecentTransactions = () => {
  const [showAll, setShowAll] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  
  // Use centralized data context
  const { recentTransactions: transactions, loading } = useExpenseData();
  const toast = useToast();

  // Using Tamagui theme instead of useColorModeValue - following migration guide Pattern 2
  const theme = useTheme();
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const heading = theme.color.val;
  const text = theme.color.val;
  const subtext = theme.color11?.val || '#64748B';
  const sectionHeaderBg = theme.backgroundHover.val;
  const transactionItemBg = theme.background.val;

  // Group transactions by date
  const groupTransactionsByDate = (transactions: any[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: { [key: string]: any[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': []
    };

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const diffTime = today.getTime() - txDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups['Today'].push(tx);
      } else if (diffDays === 1) {
        groups['Yesterday'].push(tx);
      } else if (diffDays <= 7) {
        groups['This Week'].push(tx);
      }
    });

    return groups;
  };

  // Show only first 5 transactions initially
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);
  const groupedTransactions = groupTransactionsByDate(displayedTransactions);

  // Enhanced icon mapping with category-based colors
  const getTransactionIcon = (description: string, category: string) => {
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
      'default': { icon: 'card', color: '#6B7280', bg: '#F3F4F6' }
    };

    // Special cases for specific descriptions
    if (description.toLowerCase().includes('coffee')) {
      return { icon: 'cafe', color: '#92400E', bg: '#FEF3C7' };
    }
    if (description.toLowerCase().includes('groceries')) {
      return { icon: 'basket', color: '#059669', bg: '#D1FAE5' };
    }

    return iconMap[category] || iconMap.default;
  };

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#F59E0B', text: 'Pending' };
      case 'completed':
        return { color: '#10B981', text: 'Completed' };
      default:
        return { color: '#6B7280', text: 'Unknown' };
    }
  };

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Show loading state
  if (loading) {
    return (
      <View 
        padding="$6" 
        borderRadius="$6" 
        backgroundColor={cardBg} 
        borderWidth={1}
        borderColor={border}
        marginBottom="$6"
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Text color="#3B82F6">Loading...</Text>
        <Text marginTop="$4" color={subtext}>
          Loading recent transactions...
        </Text>
      </View>
    );
  }

  // Show empty state if no transactions
  if (transactions.length === 0) {
    return (
      <View 
        padding="$6" 
        borderRadius="$6" 
        backgroundColor={cardBg} 
        borderWidth={1}
        borderColor={border}
        marginBottom="$6"
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Ionicons name="receipt-outline" size={40} color={subtext} />
        <Text marginTop="$4" color={subtext} textAlign="center" fontSize="$4">
          No transactions yet
        </Text>
        <Text marginTop="$2" color={subtext} textAlign="center" fontSize="$3">
          Start by adding your first expense
        </Text>
      </View>
    );
  }

  // Enhanced transaction item with animations and swipe gestures
  const renderTransaction = (tx: any, index: number) => {
    const iconData = getTransactionIcon(tx.description, tx.category);
    const statusData = getStatusIndicator(tx.status);
    const isExpanded = expandedTransaction === tx.id;

    // Animation values for entrance animation
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.95);

    // Swipe gesture values
    const translateX = useSharedValue(0);
    const swipeOpacity = useSharedValue(1);

    // Entrance animation
    React.useEffect(() => {
      const delay = index * 100; // Stagger animation
      setTimeout(() => {
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 400 });
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      }, delay);
    }, []);

    // Animated styles for entrance
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    }));

    // Animated styles for swipe
    const swipeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: swipeOpacity.value,
    }));

    // Swipe gesture handler
    const swipeGesture = Gesture.Pan()
      .onStart(() => {
        runOnJS(hapticFeedback.light)();
      })
      .onUpdate((event) => {
        // Only allow left swipe (negative values)
        if (event.translationX < 0) {
          translateX.value = Math.max(event.translationX, -100);
          
          // Provide haptic feedback at certain thresholds
          if (event.translationX < -50 && translateX.value > -51) {
            runOnJS(hapticFeedback.medium)();
          }
        }
      })
      .onEnd((event) => {
        if (event.translationX < -80) {
          // Swipe threshold reached - show action menu
          runOnJS(hapticFeedback.heavy)();
          runOnJS(() => {
            toast.info('Swipe Actions', 'Edit, Delete, or View Details');
          })();
          
          // Animate back to original position
          translateX.value = withSpring(0);
        } else {
          // Return to original position
          translateX.value = withSpring(0);
        }
      });

    // Handle tap with haptic feedback
    const handlePress = () => {
      hapticFeedback.light();
      setExpandedTransaction(isExpanded ? null : tx.id);
    };

    // Handle long press with haptic feedback
    const handleLongPress = () => {
      hapticFeedback.heavy();
      toast.info('Transaction Actions', 'Long press detected - showing options');
    };

    return (
      <Animated.View key={tx.id} style={animatedStyle}>
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={swipeStyle}>
            <TouchableOpacity
              onPress={handlePress}
              onLongPress={handleLongPress}
              activeOpacity={0.7}
            >
              <View
                padding="$3"
                borderRadius="$5"
                backgroundColor={transactionItemBg}
                borderWidth={1}
                borderColor={isExpanded ? '#3B82F6' : 'transparent'}
                marginBottom="$2"
                shadowColor="$shadowColor"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={4}
              >
                <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  {/* Icon and main info */}
                  <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View
                      padding="$2"
                      backgroundColor={iconData.bg}
                      borderRadius="$5"
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                    >
                      <Ionicons 
                        name={iconData.icon as keyof typeof Ionicons.glyphMap} 
                        size={18} 
                        color={iconData.color} 
                      />
                      {/* Receipt indicator with pulse animation */}
                      {tx.hasReceipt && (
                        <View
                          position="absolute"
                          top={-4}
                          right={-4}
                          backgroundColor="#3B82F6"
                          borderRadius="$6"
                          width={8}
                          height={8}
                        />
                      )}
                    </View>
                    
                    <RNView style={{ flex: 1, gap: 4 }}>
                      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text fontSize="$4" fontWeight="600" color={text} flex={1}>
                          {tx.description}
                        </Text>
                        {tx.isUnusual && (
                          <View backgroundColor="#FED7AA" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                            <Text fontSize="$2" color="#EA580C" fontWeight="500">
                              Unusual
                            </Text>
                          </View>
                        )}
                      </RNView>
                      
                      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text fontSize="$3" color={subtext}>
                          {tx.vendor || tx.category}
                        </Text>
                        <Text fontSize="$3" color={statusData.color}>
                          {statusData.text}
                        </Text>
                      </RNView>
                    </RNView>
                  </RNView>

                  {/* Amount */}
                  <RNView style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text fontSize="$5" fontWeight="700" color={text}>
                      ${tx.amount.toFixed(2)}
                    </Text>
                    <Text fontSize="$2" color={subtext}>
                      {new Date(tx.date).toLocaleDateString()}
                    </Text>
                  </RNView>
                </RNView>

                {/* Expanded details with smooth animation */}
                {isExpanded && (
                  <Animated.View
                    entering={FadeInDown.duration(300)}
                    exiting={FadeOutUp.duration(200)}
                  >
                    <RNView style={{ gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: border }}>
                      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text fontSize="$3" color={subtext}>Category:</Text>
                        <Text fontSize="$3" color={text} fontWeight="500">{tx.category}</Text>
                      </RNView>
                      {tx.vendor && (
                        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text fontSize="$3" color={subtext}>Vendor:</Text>
                          <Text fontSize="$3" color={text} fontWeight="500">{tx.vendor}</Text>
                        </RNView>
                      )}
                      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text fontSize="$3" color={subtext}>Date:</Text>
                        <Text fontSize="$3" color={text} fontWeight="500">
                          {new Date(tx.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </RNView>
                    </RNView>
                  </Animated.View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    );
  };

  // Render grouped transactions with staggered animations
  const renderGroupedTransactions = () => {
    let globalIndex = 0; // Track global index for staggered animations
    
    return Object.entries(groupedTransactions).map(([groupName, transactions]) => {
      if (transactions.length === 0) return null;

      return (
        <RNView key={groupName} style={{ gap: 8, marginBottom: 16 }}>
          <Text fontSize="$2" fontWeight="700" color={subtext} textTransform="uppercase">
            {groupName}
          </Text>
          {transactions.map((tx, localIndex) => {
            const result = renderTransaction(tx, globalIndex);
            globalIndex++;
            return result;
          })}
        </RNView>
      );
    });
  };

  return (
    <View 
      padding="$5" 
      borderWidth={1} 
      borderRadius="$6" 
      marginBottom="$6" 
      backgroundColor={cardBg} 
      borderColor={border}
    >
      {/* Enhanced header with insights */}
      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <RNView>
          <Text fontSize="$5" fontWeight="700" color={heading}>
            Recent Transactions
          </Text>
          {transactions.some(tx => tx.isUnusual) && (
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="alert-circle" size={12} color="#F59E0B" />
              <Text fontSize="$2" color="#F59E0B">
                Unusual spending detected
              </Text>
            </RNView>
          )}
        </RNView>
        
        {transactions.length > 5 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text fontSize="$3" color="#3B82F6" fontWeight="500">
                {showAll ? 'Show Less' : `+${transactions.length - 5} more`}
              </Text>
              <Ionicons 
                name={showAll ? 'chevron-up' : 'chevron-down'} 
                size={12} 
                color="#3B82F6" 
              />
            </RNView>
          </TouchableOpacity>
        )}
      </RNView>

      {/* Grouped transaction list */}
      {showAll ? renderGroupedTransactions() : (
        <RNView style={{ gap: 8 }}>
          {displayedTransactions.map(renderTransaction)}
        </RNView>
      )}

      {/* Enhanced action button */}
      <TouchableOpacity 
        style={{ 
          marginTop: 16, 
          backgroundColor: '#3B82F6', 
          borderRadius: 20, 
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
        onPress={() => navigation.navigate('ExpensesList')}
      >
        <Ionicons name="list" size={16} color="white" />
        <Text color="white" fontWeight="600">
          View All Expenses
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecentTransactions; 