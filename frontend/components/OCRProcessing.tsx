import React, { useState } from 'react';
import { View as RNView, TouchableOpacity } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { processReceiptWithOCR, OCRExtractedData } from '../services/receiptService';

interface OCRProcessingProps {
  receiptId: string;
  onProcessingComplete: (extractedData: OCRExtractedData) => void;
  onError: (error: string) => void;
}

export const OCRProcessing: React.FC<OCRProcessingProps> = ({
  receiptId,
  onProcessingComplete,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<OCRExtractedData | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();
  const bgColor = theme.backgroundHover.val;
  const borderColor = theme.borderColor.val;

  const handleProcessReceipt = async () => {
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      console.log('🔍 Starting OCR processing...');
      
      // Show processing message
      console.log('Processing Receipt: Extracting data from your receipt...');

      // Process receipt with OCR
      const result = await processReceiptWithOCR(receiptId);
      
      console.log('✅ OCR processing complete:', result.extractedData);
      setExtractedData(result.extractedData);
      setShowResults(true);
      
      // Show success message
      console.log('🎉 Processing Complete! Receipt data extracted successfully');

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';
      
      // Show error message
      console.log('❌ Processing Failed:', errorMessage);
      
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseExtractedData = () => {
    if (extractedData) {
      onProcessingComplete(extractedData);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <View backgroundColor="#10B981" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
          <Text fontSize="$2" color="white" fontWeight="600">High</Text>
        </View>
      );
    } else if (confidence >= 0.6) {
      return (
        <View backgroundColor="#F59E0B" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
          <Text fontSize="$2" color="white" fontWeight="600">Medium</Text>
        </View>
      );
    } else {
      return (
        <View backgroundColor="#EF4444" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
          <Text fontSize="$2" color="white" fontWeight="600">Low</Text>
        </View>
      );
    }
  };

  return (
    <View
      backgroundColor={bgColor}
      borderRadius="$6"
      padding="$4"
      borderWidth={1}
      borderColor={borderColor}
    >
      <RNView style={{ gap: 16 }}>
        {/* Header */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text fontSize="$5" fontWeight="bold" color={theme.color.val}>
            🔍 Smart Receipt Processing
          </Text>
          {!showResults && (
            <TouchableOpacity
              onPress={handleProcessReceipt}
              disabled={isProcessing}
              style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text color="white" fontSize="$3" fontWeight="600">
                {isProcessing ? 'Processing...' : 'Extract Data'}
              </Text>
            </TouchableOpacity>
          )}
        </RNView>

        {/* Processing State */}
        {isProcessing && (
          <View backgroundColor="#EBF8FF" padding="$4" borderRadius="$4" borderWidth={1} borderColor="#BEE3F8">
            <RNView style={{ gap: 12 }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text fontSize="$5">ℹ️</Text>
                <Text fontSize="$4" fontWeight="bold" color="#2B6CB0">
                  Processing Receipt
                </Text>
              </RNView>
              <Text fontSize="$3" color="#2C5282">
                Using AI to extract amount, date, and vendor information...
              </Text>
              <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text color="#2C5282">⏳</Text>
                <Text fontSize="$3" color="#2C5282">
                  This may take a few seconds
                </Text>
              </RNView>
            </RNView>
          </View>
        )}

        {/* Results Display */}
        {showResults && extractedData && (
          <RNView style={{ gap: 16 }}>
            <View backgroundColor="#F0FDF4" padding="$4" borderRadius="$4" borderWidth={1} borderColor="#BBF7D0">
              <RNView style={{ gap: 8 }}>
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text fontSize="$5">✅</Text>
                  <Text fontSize="$4" fontWeight="bold" color="#15803D">
                    Data Extracted Successfully!
                  </Text>
                </RNView>
                <Text fontSize="$3" color="#166534">
                  Review the extracted information below and use it to fill your expense form.
                </Text>
              </RNView>
            </View>

            {/* Extracted Data Display */}
            <View backgroundColor="#F9FAFB" padding="$4" borderRadius="$4">
              <RNView style={{ gap: 12 }}>
                <Text fontSize="$4" fontWeight="bold" color="#374151">
                  📄 Extracted Information
                </Text>

                {/* Amount */}
                {extractedData.amount && (
                  <>
                    <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <RNView style={{ flex: 1 }}>
                        <Text fontSize="$3" color="#6B7280">Amount</Text>
                        <Text fontSize="$5" fontWeight="bold" color="#059669">
                          ${extractedData.amount.toFixed(2)}
                        </Text>
                      </RNView>
                      {getConfidenceBadge(extractedData.confidence.amount)}
                    </RNView>
                    <View height={1} backgroundColor="#E5E7EB" />
                  </>
                )}

                {/* Date */}
                {extractedData.date && (
                  <>
                    <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <RNView style={{ flex: 1 }}>
                        <Text fontSize="$3" color="#6B7280">Date</Text>
                        <Text fontSize="$4" fontWeight="600" color={theme.color.val}>
                          {new Date(extractedData.date).toLocaleDateString()}
                        </Text>
                      </RNView>
                      {getConfidenceBadge(extractedData.confidence.date)}
                    </RNView>
                    <View height={1} backgroundColor="#E5E7EB" />
                  </>
                )}

                {/* Vendor */}
                {extractedData.vendor && (
                  <>
                    <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <RNView style={{ flex: 1 }}>
                        <Text fontSize="$3" color="#6B7280">Vendor</Text>
                        <Text fontSize="$4" fontWeight="600" color={theme.color.val}>
                          {extractedData.vendor}
                        </Text>
                      </RNView>
                      {getConfidenceBadge(extractedData.confidence.vendor)}
                    </RNView>
                    <View height={1} backgroundColor="#E5E7EB" />
                  </>
                )}

                {/* Category */}
                {extractedData.category && (
                  <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <RNView style={{ flex: 1 }}>
                      <Text fontSize="$3" color="#6B7280">Suggested Category</Text>
                      <Text fontSize="$4" fontWeight="600" color="#2563EB">
                        {extractedData.category}
                      </Text>
                    </RNView>
                    <View backgroundColor="#DBEAFE" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" borderWidth={1} borderColor="#3B82F6">
                      <Text fontSize="$2" color="#1D4ED8" fontWeight="600">Auto</Text>
                    </View>
                  </RNView>
                )}
              </RNView>
            </View>

            {/* Action Buttons */}
            <RNView style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
              <TouchableOpacity onPress={handleUseExtractedData} style={{ flex: 1 }}>
                <View
                  backgroundColor="#10B981"
                  padding="$4"
                  borderRadius="$6"
                  alignItems="center"
                >
                  <Text color="white" fontSize="$4" fontWeight="600">
                    ✨ Use This Data
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowResults(false)} style={{ flex: 1 }}>
                <View
                  backgroundColor="transparent"
                  borderWidth={1}
                  borderColor="#6B7280"
                  padding="$4"
                  borderRadius="$6"
                  alignItems="center"
                >
                  <Text color="#6B7280" fontSize="$4" fontWeight="600">
                    Try Again
                  </Text>
                </View>
              </TouchableOpacity>
            </RNView>

            {/* Confidence Info */}
            <View backgroundColor="#EBF8FF" padding="$3" borderRadius="$3">
              <Text fontSize="$2" color="#1E40AF" textAlign="center">
                💡 Confidence levels indicate how sure we are about each field. 
                You can always edit the information in the expense form.
              </Text>
            </View>
          </RNView>
        )}

        {/* Initial State */}
        {!isProcessing && !showResults && (
          <View backgroundColor="#F9FAFB" padding="$4" borderRadius="$4">
            <RNView style={{ gap: 8, alignItems: 'center' }}>
              <Text fontSize="$8">🤖</Text>
              <Text fontSize="$4" fontWeight="600" textAlign="center" color={theme.color.val}>
                Smart Receipt Processing
              </Text>
              <Text fontSize="$3" color="#6B7280" textAlign="center">
                Let AI extract amount, date, vendor, and category from your receipt automatically.
              </Text>
            </RNView>
          </View>
        )}
      </RNView>
    </View>
  );
}; 