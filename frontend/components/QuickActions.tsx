import React from 'react';
import { TouchableOpacity, View as RNView, Text as RNText, StyleSheet } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  ExpensesList: undefined;
  AddEditExpense: undefined;
  Reports: undefined;
  Categories: undefined;
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// QuickActions component with fallback styling for maximum reliability
interface QuickActionsProps {
  onUploadPress: () => void;
  isUploading?: boolean;
}

// Fallback styles using StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: 0,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  loadingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 8,
    color: 'white',
  },
});

const QuickActions: React.FC<QuickActionsProps> = ({ onUploadPress, isUploading = false }) => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const toast = useToast();

  // Try to use theme colors, fallback to hardcoded values
  let cardBg, border, text, subtext;
  try {
    cardBg = theme.backgroundHover?.val || '#F8F9FA';
    border = theme.borderColor?.val || '#E5E7EB';
    text = theme.color?.val || '#1F2937';
    subtext = theme.color11?.val || '#64748B';
  } catch (error) {
    console.warn('QuickActions: Theme error, using fallbacks:', error);
    cardBg = '#F8F9FA';
    border = '#E5E7EB';
    text = '#1F2937';
    subtext = '#64748B';
  }

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
        try {
          hapticFeedback.buttonPress();
          if (isUploading) {
            toast.warning('Upload in Progress', 'Please wait for current upload to complete');
            return;
          }
          onUploadPress();
        } catch (error) {
          console.error('QuickActions: Error in scan action:', error);
        }
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
        try {
          hapticFeedback.buttonPress();
          navigation.navigate('AddEditExpense');
        } catch (error) {
          console.error('QuickActions: Error in add action:', error);
        }
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
        try {
          hapticFeedback.buttonPress();
          navigation.navigate('Reports');
        } catch (error) {
          console.error('QuickActions: Error in reports action:', error);
        }
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
        try {
          hapticFeedback.buttonPress();
          navigation.navigate('ExpensesList');
        } catch (error) {
          console.error('QuickActions: Error in search action:', error);
        }
      },
      disabled: false,
    },
  ];

  // Simplified action button component with fallback styling
  const ActionButton: React.FC<{ action: typeof actions[0]; index: number }> = ({ action, index }) => {
    const handlePress = () => {
      try {
        if (action.disabled) {
          hapticFeedback.error();
          return;
        }
        
        // Success haptic feedback
        hapticFeedback.success();
        action.onPress();
      } catch (error) {
        console.error(`QuickActions: Error handling press for ${action.id}:`, error);
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={action.disabled}
        activeOpacity={0.7}
        style={[styles.button, action.disabled && styles.buttonDisabled]}
      >
        {/* Icon container */}
        <RNView style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
          <Ionicons
            name={action.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={action.color}
          />
          {/* Loading indicator for upload */}
          {action.id === 'scan' && isUploading && (
            <RNView style={styles.loadingIndicator}>
              <RNText style={styles.loadingText}>⏳</RNText>
            </RNView>
          )}
        </RNView>

        {/* Text content */}
        <RNText style={styles.buttonTitle}>
          {action.title}
        </RNText>
        <RNText style={styles.buttonSubtitle}>
          {action.subtitle}
        </RNText>
      </TouchableOpacity>
    );
  };

  // Use fallback styling with StyleSheet
  return (
    <RNView style={styles.container}>
      {/* Header */}
      <RNText style={styles.header}>
        Quick Actions
      </RNText>

      {/* Action buttons grid */}
      <RNView>
        {/* First row */}
        <RNView style={styles.row}>
          <ActionButton action={actions[0]} index={0} />
          <ActionButton action={actions[1]} index={1} />
        </RNView>
        
        {/* Second row */}
        <RNView style={styles.row}>
          <ActionButton action={actions[2]} index={2} />
          <ActionButton action={actions[3]} index={3} />
        </RNView>
      </RNView>

      {/* Simple text links for Settings and Categories */}
      <RNView style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        gap: 32, 
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
      }}>
        <TouchableOpacity 
          onPress={() => {
            try {
              hapticFeedback.buttonPress();
              navigation.navigate('Categories');
            } catch (error) {
              console.error('QuickActions: Error navigating to Categories:', error);
            }
          }}
          activeOpacity={0.7}
        >
          <RNText style={{
            fontSize: 15,
            color: '#6B7280',
            fontWeight: '500',
            letterSpacing: 0.3
          }}>
            Categories
          </RNText>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            try {
              hapticFeedback.buttonPress();
              navigation.navigate('Settings');
            } catch (error) {
              console.error('QuickActions: Error navigating to Settings:', error);
            }
          }}
          activeOpacity={0.7}
        >
          <RNText style={{
            fontSize: 15,
            color: '#6B7280',
            fontWeight: '500',
            letterSpacing: 0.3
          }}>
            Settings
          </RNText>
        </TouchableOpacity>
      </RNView>
    </RNView>
  );
};

export default QuickActions; 