import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility for enhanced user experience
 * Provides different types of haptic feedback for various interactions
 */

export const hapticFeedback = {
  // Light impact for subtle interactions (button taps, toggles)
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  // Medium impact for standard interactions (swipes, selections)
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  // Heavy impact for important actions (delete, confirm)
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Success feedback for positive actions
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // Warning feedback for cautionary actions
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  // Error feedback for failed actions
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  // Selection feedback for picker/selector changes
  selection: () => {
    Haptics.selectionAsync();
  },

  // Custom feedback combinations for specific actions
  swipeAction: () => {
    // Medium impact for swipe gestures
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  buttonPress: () => {
    // Light impact for button presses
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  longPress: () => {
    // Heavy impact for long press actions
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  pullToRefresh: () => {
    // Light impact when pull-to-refresh is triggered
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  expenseAdded: () => {
    // Success notification for adding expenses
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  expenseDeleted: () => {
    // Warning notification for deleting expenses
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  receiptScanned: () => {
    // Success notification for successful receipt scan
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  formValidationError: () => {
    // Error notification for form validation errors
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
}; 