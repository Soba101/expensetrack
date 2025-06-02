import React, { useState } from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseData } from '../context/ExpenseDataContext';
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

// Enhanced RecentTransactions component with Tamagui animations and haptic feedback
const RecentTransactions = () => {
  const [showAll, setShowAll] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  // Track pressed state for all transactions using a Set
  const [pressedTransactions, setPressedTransactions] = useState<Set<string>>(new Set());
  
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

  // Enhanced transaction item with Tamagui animations
  const renderTransaction = (tx: any, index: number) => {
    const iconData = getTransactionIcon(tx.description, tx.category);
    const statusData = getStatusIndicator(tx.status);
    const isExpanded = expandedTransaction === tx.id;
    const isPressed = pressedTransactions.has(tx.id);

    const handlePress = () => {
      hapticFeedback.buttonPress();
      setExpandedTransaction(isExpanded ? null : tx.id);
    };

    const handleLongPress = () => {
      hapticFeedback.success();
      toast.info('Transaction Details', `${tx.description} - $${tx.amount}`);
    };

    const handlePressIn = () => {
      setPressedTransactions(prev => new Set(prev).add(tx.id));
    };

    const handlePressOut = () => {
      setPressedTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(tx.id);
        return newSet;
      });
    };

    return (
      <View
        key={tx.id}
        animation="bouncy"
        enterStyle={{
          opacity: 0,
          y: 50,
          scale: 0.95,
        }}
        animateOnly={['opacity', 'transform']}
        scale={isPressed ? 0.98 : 1}
        marginBottom="$3"
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View
            backgroundColor={transactionItemBg}
            borderRadius="$5"
            borderWidth={1}
            borderColor={border}
            padding="$4"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.05}
            shadowRadius={2}
          >
            <View flexDirection="row" alignItems="center" gap="$3">
              {/* Icon */}
              <View
                width={48}
                height={48}
                borderRadius="$6"
                backgroundColor={iconData.bg}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name={iconData.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={iconData.color}
                />
              </View>

              {/* Transaction details */}
              <View flex={1}>
                <View flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                  <View flex={1}>
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color={text}
                      numberOfLines={1}
                    >
                      {tx.description}
                    </Text>
                    <Text
                      fontSize="$3"
                      color={subtext}
                      marginTop="$1"
                    >
                      {tx.category}
                    </Text>
                  </View>

                  {/* Amount and status */}
                  <View alignItems="flex-end">
                    <Text
                      fontSize="$4"
                      fontWeight="700"
                      color={text}
                    >
                      ${tx.amount}
                    </Text>
                    <View
                      backgroundColor={statusData.color}
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      marginTop="$1"
                    >
                      <Text
                        fontSize="$1"
                        color="white"
                        fontWeight="600"
                      >
                        {statusData.text}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Expanded details with Tamagui animation */}
                {isExpanded && (
                  <View
                    marginTop="$3"
                    paddingTop="$3"
                    borderTopWidth={1}
                    borderTopColor={border}
                    animation="quick"
                    enterStyle={{
                      opacity: 0,
                      height: 0,
                    }}
                    animateOnly={['opacity', 'height']}
                  >
                    <View flexDirection="row" justifyContent="space-between" marginBottom="$2">
                      <Text fontSize="$3" color={subtext}>Date:</Text>
                      <Text fontSize="$3" color={text}>{new Date(tx.date).toLocaleDateString()}</Text>
                    </View>
                    <View flexDirection="row" justifyContent="space-between" marginBottom="$2">
                      <Text fontSize="$3" color={subtext}>Time:</Text>
                      <Text fontSize="$3" color={text}>{new Date(tx.date).toLocaleTimeString()}</Text>
                    </View>
                    {tx.notes && (
                      <View marginTop="$2">
                        <Text fontSize="$3" color={subtext} marginBottom="$1">Notes:</Text>
                        <Text fontSize="$3" color={text}>{tx.notes}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
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