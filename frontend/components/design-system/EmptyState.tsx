import React from 'react';
import { View, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// EmptyState: Reusable component for empty state displays
// Provides consistent empty state messaging with call-to-action buttons
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
  backgroundColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonPress,
  backgroundColor = 'white',
}) => {
  return (
    <View
      backgroundColor={backgroundColor}
      borderRadius={12}
      padding={32}
      alignItems="center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <Ionicons name={icon as any} size={40} color="#8E8E93" />
      
      <Text 
        fontSize={17} 
        fontWeight="500" 
        color="#8E8E93" 
        marginTop={12} 
        textAlign="center"
      >
        {title}
      </Text>
      
      <Text 
        fontSize={15} 
        color="#8E8E93" 
        marginTop={4} 
        textAlign="center"
        lineHeight={20}
      >
        {description}
      </Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity
          onPress={onButtonPress}
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            marginTop: 16,
          }}
          activeOpacity={0.8}
        >
          <Text color="white" fontWeight="600">
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState; 