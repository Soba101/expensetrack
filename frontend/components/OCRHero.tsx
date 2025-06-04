import React, { useState } from 'react';
import { View as RNView, TouchableOpacity, Dimensions } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticFeedback } from '../utils/haptics';

// OCRHero component - Primary focus on receipt scanning with OCR
// Features: Large scan button, recent scans, scanning tips, progress indicators
interface OCRHeroProps {
  onScanPress: () => void;
  onCameraPress: () => void;
  isUploading?: boolean;
  recentScans?: number;
}

const { width } = Dimensions.get('window');

const OCRHero: React.FC<OCRHeroProps> = ({ 
  onScanPress, 
  onCameraPress, 
  isUploading = false,
  recentScans = 0 
}) => {
  const [showTips, setShowTips] = useState(false);
  const theme = useTheme();

  // Theme colors
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';

  // Scanning tips for better OCR results
  const scanningTips = [
    "📱 Hold phone steady and ensure good lighting",
    "📄 Flatten receipt and avoid shadows", 
    "🔍 Make sure text is clear and readable",
    "✨ AI works best with high-contrast images"
  ];

  return (
    <View marginBottom="$6">
      {/* Hero Section with Gradient Background */}
      <View
        borderRadius="$6"
        overflow="hidden"
        marginBottom="$4"
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 24,
            minHeight: 200,
          }}
        >
          {/* Header */}
          <RNView style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text fontSize="$7" fontWeight="bold" color="white" textAlign="center">
              Scan Your Receipt
            </Text>
            <Text fontSize="$4" color="rgba(255,255,255,0.9)" textAlign="center" marginTop="$2">
              AI-powered expense tracking in seconds
            </Text>
          </RNView>

          {/* Main Scan Button */}
          <RNView style={{ alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.buttonPress();
                onScanPress();
              }}
              disabled={isUploading}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: isUploading ? 0.7 : 1,
              }}
            >
              {isUploading ? (
                <RNView style={{ alignItems: 'center', gap: 8 }}>
                  <Ionicons name="cloud-upload" size={32} color="#667eea" />
                  <Text fontSize="$2" color="#667eea" fontWeight="600">
                    Processing...
                  </Text>
                </RNView>
              ) : (
                <RNView style={{ alignItems: 'center', gap: 8 }}>
                  <Ionicons name="camera" size={36} color="#667eea" />
                  <Text fontSize="$3" color="#667eea" fontWeight="600">
                    Scan
                  </Text>
                </RNView>
              )}
            </TouchableOpacity>
          </RNView>

          {/* Action Buttons Row */}
          <RNView style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.buttonPress();
                onCameraPress();
              }}
              disabled={isUploading}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text color="white" fontWeight="600" fontSize="$3">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                hapticFeedback.buttonPress();
                onScanPress();
              }}
              disabled={isUploading}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Ionicons name="images-outline" size={20} color="white" />
              <Text color="white" fontWeight="600" fontSize="$3">
                From Gallery
              </Text>
            </TouchableOpacity>
          </RNView>
        </LinearGradient>
      </View>

      {/* Stats and Tips Section */}
      <RNView style={{ flexDirection: 'row', gap: 12 }}>
        {/* Recent Scans Stats */}
        <View
          flex={1}
          padding="$4"
          borderRadius="$5"
          backgroundColor={theme.backgroundHover.val}
          borderWidth={1}
          borderColor={theme.borderColor.val}
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="#EBF8FF"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="receipt" size={16} color="#3B82F6" />
            </View>
            <Text fontSize="$3" color={secondaryText} fontWeight="500">
              This Month
            </Text>
          </RNView>
          <Text fontSize="$6" fontWeight="bold" color={primaryText}>
            {recentScans}
          </Text>
          <Text fontSize="$2" color={secondaryText}>
            receipts scanned
          </Text>
        </View>

        {/* Scanning Tips */}
        <View
          flex={1}
          padding="$4"
          borderRadius="$5"
          backgroundColor={theme.backgroundHover.val}
          borderWidth={1}
          borderColor={theme.borderColor.val}
        >
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.buttonPress();
              setShowTips(!showTips);
            }}
          >
            <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="#FEF3C7"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="bulb" size={16} color="#F59E0B" />
              </View>
              <Text fontSize="$3" color={secondaryText} fontWeight="500">
                Scan Tips
              </Text>
              <Ionicons 
                name={showTips ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={secondaryText} 
              />
            </RNView>
            <Text fontSize="$6" fontWeight="bold" color={primaryText}>
              Pro Tips
            </Text>
            <Text fontSize="$2" color={secondaryText}>
              for better results
            </Text>
          </TouchableOpacity>
        </View>
      </RNView>

      {/* Expandable Tips */}
      {showTips && (
        <View
          marginTop="$3"
          padding="$4"
          borderRadius="$5"
          backgroundColor={theme.backgroundHover.val}
          borderWidth={1}
          borderColor={theme.borderColor.val}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$3">
            📸 Get Perfect Scans Every Time
          </Text>
          <RNView style={{ gap: 8 }}>
            {scanningTips.map((tip, index) => (
              <Text key={index} fontSize="$3" color={secondaryText} lineHeight={20}>
                {tip}
              </Text>
            ))}
          </RNView>
        </View>
      )}

      {/* Processing Indicator */}
      {isUploading && (
        <View
          marginTop="$3"
          padding="$4"
          borderRadius="$5"
          backgroundColor="#EBF8FF"
          borderWidth={1}
          borderColor="#BFDBFE"
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="cloud-upload" size={24} color="#3B82F6" />
            <RNView style={{ flex: 1 }}>
              <Text fontSize="$4" fontWeight="600" color="#1E40AF">
                🤖 AI is analyzing your receipt...
              </Text>
              <Text fontSize="$3" color="#3B82F6" marginTop="$1">
                Extracting amount, date, and merchant details
              </Text>
            </RNView>
          </RNView>
        </View>
      )}
    </View>
  );
};

export default OCRHero; 