import React from 'react';
import { TouchableOpacity, View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  ExpensesList: undefined;
  AddEditExpense: undefined;
  Reports: undefined;
  Categories: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// QuickActions component with enhanced animations and haptic feedback
interface QuickActionsProps {
  onUploadPress: () => void;
  isUploading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onUploadPress, isUploading = false }) => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const toast = useToast();

  // Theme colors
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const text = theme.color.val;
  const subtext = theme.color11?.val || '#64748B';

  // Action button data with enhanced styling
  const actions = [
    {
      id: 'scan',
      title: 'Scan Receipt',
      subtitle: 'Camera & OCR',
      icon: 'camera',
      color: '#10B981',
      bgColor: '#D1FAE5',
      onPress: () => {
        hapticFeedback.buttonPress();
        if (isUploading) {
          toast.warning('Upload in Progress', 'Please wait for current upload to complete');
          return;
        }
        onUploadPress();
      },
      disabled: isUploading,
    },
    {
      id: 'add',
      title: 'Add Expense',
      subtitle: 'Manual entry',
      icon: 'add-circle',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      onPress: () => {
        hapticFeedback.buttonPress();
        navigation.navigate('AddEditExpense');
      },
      disabled: false,
    },
    {
      id: 'reports',
      title: 'View Reports',
      subtitle: 'Analytics',
      icon: 'bar-chart',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      onPress: () => {
        hapticFeedback.buttonPress();
        navigation.navigate('Reports');
      },
      disabled: false,
    },
    {
      id: 'search',
      title: 'Search',
      subtitle: 'Find expenses',
      icon: 'search',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      onPress: () => {
        hapticFeedback.buttonPress();
        navigation.navigate('ExpensesList');
      },
      disabled: false,
    },
  ];

  // Enhanced action button component with animations
  const ActionButton: React.FC<{ action: typeof actions[0]; index: number }> = ({ action, index }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);

    // Entrance animation
    React.useEffect(() => {
      const delay = index * 100; // Stagger animation
      setTimeout(() => {
        opacity.value = withTiming(1, { duration: 400 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }, delay);
    }, []);

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    }));

    // Press animation
    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const handlePress = () => {
      if (action.disabled) {
        hapticFeedback.error();
        return;
      }
      
      // Success haptic feedback
      hapticFeedback.success();
      action.onPress();
    };

    return (
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={action.disabled}
          activeOpacity={0.8}
          style={{
            opacity: action.disabled ? 0.6 : 1,
          }}
        >
          <View
            padding="$4"
            backgroundColor={cardBg}
            borderRadius="$5"
            borderWidth={1}
            borderColor={border}
            alignItems="center"
            justifyContent="center"
            minHeight={100}
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
          >
            {/* Icon container with enhanced styling */}
            <View
              padding="$3"
              backgroundColor={action.bgColor}
              borderRadius="$6"
              marginBottom="$3"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name={action.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={action.color}
              />
              {/* Loading indicator for upload */}
              {action.id === 'scan' && isUploading && (
                <View
                  position="absolute"
                  top={-2}
                  right={-2}
                  backgroundColor="#F59E0B"
                  borderRadius="$6"
                  width={12}
                  height={12}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$1" color="white">⏳</Text>
                </View>
              )}
            </View>

            {/* Text content */}
            <Text
              fontSize="$3"
              fontWeight="600"
              color={text}
              textAlign="center"
              marginBottom="$1"
            >
              {action.title}
            </Text>
            <Text
              fontSize="$2"
              color={subtext}
              textAlign="center"
            >
              {action.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View
      padding="$5"
      borderRadius="$6"
      backgroundColor={cardBg}
      borderWidth={1}
      borderColor={border}
      marginBottom="$6"
    >
      {/* Header */}
      <Text fontSize="$5" fontWeight="700" color={text} marginBottom="$4">
        Quick Actions
      </Text>

      {/* Action buttons grid */}
      <RNView style={{ gap: 12 }}>
        {/* First row */}
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
          <ActionButton action={actions[0]} index={0} />
          <ActionButton action={actions[1]} index={1} />
        </RNView>
        
        {/* Second row */}
        <RNView style={{ flexDirection: 'row', gap: 12 }}>
          <ActionButton action={actions[2]} index={2} />
          <ActionButton action={actions[3]} index={3} />
        </RNView>
      </RNView>
    </View>
  );
};

export default QuickActions; 