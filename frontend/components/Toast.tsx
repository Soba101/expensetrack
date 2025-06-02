import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

// Create Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Component with Tamagui animations
const ToastItem: React.FC<{ 
  toast: ToastData; 
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(true);

  // Toast colors based on type
  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: '#10B981',
          icon: 'checkmark-circle',
          iconColor: '#FFFFFF'
        };
      case 'error':
        return {
          bg: '#EF4444',
          icon: 'close-circle',
          iconColor: '#FFFFFF'
        };
      case 'warning':
        return {
          bg: '#F59E0B',
          icon: 'warning',
          iconColor: '#FFFFFF'
        };
      case 'info':
      default:
        return {
          bg: '#3B82F6',
          icon: 'information-circle',
          iconColor: '#FFFFFF'
        };
    }
  };

  const colors = getToastColors(toast.type);

  // Auto-hide after duration
  React.useEffect(() => {
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  // Hide animation
  const hideToast = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before removing
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  }, [toast.id, onRemove]);

  if (!isVisible) return null;

  return (
    <View
      position="absolute"
      top={insets.top + 10}
      left={16}
      right={16}
      zIndex={9999}
      animation="quick"
      enterStyle={{
        opacity: 0,
        y: -100,
      }}
      exitStyle={{
        opacity: 0,
        y: -100,
      }}
      animateOnly={['opacity', 'transform']}
    >
      <View
        backgroundColor={colors.bg}
        borderRadius="$6"
        padding="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3}
        shadowRadius={8}
      >
        <View flexDirection="row" alignItems="flex-start" gap="$3">
          <Ionicons
            name={colors.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={colors.iconColor}
          />
          <View flex={1}>
            <Text
              color={colors.iconColor}
              fontSize="$4"
              fontWeight="600"
              marginBottom={toast.description ? "$1" : 0}
            >
              {toast.title}
            </Text>
            {toast.description && (
              <Text
                color={colors.iconColor}
                fontSize="$3"
                opacity={0.9}
              >
                {toast.description}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastData = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((title: string, description?: string) => {
    showToast({ type: 'success', title, description });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast({ type: 'error', title, description });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast({ type: 'info', title, description });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    showToast({ type: 'warning', title, description });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Render toasts */}
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
}; 