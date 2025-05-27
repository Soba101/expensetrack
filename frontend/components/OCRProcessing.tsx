import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Alert,
  Spinner,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
} from 'native-base';
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
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleProcessReceipt = async () => {
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      console.log('🔍 Starting OCR processing...');
      
      // Show processing toast
      toast.show({
        title: "Processing Receipt",
        description: "Extracting data from your receipt...",
        duration: 2000,
      });

      // Process receipt with OCR
      const result = await processReceiptWithOCR(receiptId);
      
      console.log('✅ OCR processing complete:', result.extractedData);
      setExtractedData(result.extractedData);
      setShowResults(true);
      
      // Show success toast
      toast.show({
        title: "🎉 Processing Complete!",
        description: "Receipt data extracted successfully",
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';
      
      // Show error toast
      toast.show({
        title: "❌ Processing Failed",
        description: errorMessage,
        duration: 4000,
      });
      
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
      return <Badge colorScheme="green" variant="solid">High</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge colorScheme="yellow" variant="solid">Medium</Badge>;
    } else {
      return <Badge colorScheme="red" variant="solid">Low</Badge>;
    }
  };

  return (
    <Box
      bg={bgColor}
      borderRadius={20}
      shadow={2}
      p={4}
      borderWidth={1}
      borderColor={borderColor}
    >
      <VStack space={4}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="bold">
            🔍 Smart Receipt Processing
          </Text>
          {!showResults && (
            <Button
              onPress={handleProcessReceipt}
              isLoading={isProcessing}
              isDisabled={isProcessing}
              colorScheme="blue"
              size="sm"
              borderRadius={15}
            >
              {isProcessing ? 'Processing...' : 'Extract Data'}
            </Button>
          )}
        </HStack>

        {/* Processing State */}
        {isProcessing && (
          <Box bg="blue.50" p={4} borderRadius={15} borderWidth={1} borderColor="blue.200">
            <VStack space={3}>
              <HStack space={2} alignItems="center">
                <Text fontSize="lg">ℹ️</Text>
                <Text fontSize="md" fontWeight="bold" color="blue.700">
                  Processing Receipt
                </Text>
              </HStack>
              <Text fontSize="sm" color="blue.600">
                Using AI to extract amount, date, and vendor information...
              </Text>
              <HStack space={2} alignItems="center">
                <Spinner size="sm" color="blue.500" />
                <Text fontSize="sm" color="blue.600">
                  This may take a few seconds
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Results Display */}
        {showResults && extractedData && (
          <VStack space={4}>
            <Box bg="green.50" p={4} borderRadius={15} borderWidth={1} borderColor="green.200">
              <VStack space={2}>
                <HStack space={2} alignItems="center">
                  <Text fontSize="lg">✅</Text>
                  <Text fontSize="md" fontWeight="bold" color="green.700">
                    Data Extracted Successfully!
                  </Text>
                </HStack>
                <Text fontSize="sm" color="green.600">
                  Review the extracted information below and use it to fill your expense form.
                </Text>
              </VStack>
            </Box>

            {/* Extracted Data Display */}
            <VStack space={3} bg="gray.50" p={4} borderRadius={15}>
              <Text fontSize="md" fontWeight="bold" color="gray.700">
                📄 Extracted Information
              </Text>

              {/* Amount */}
              {extractedData.amount && (
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color="gray.600">Amount</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      ${extractedData.amount.toFixed(2)}
                    </Text>
                  </VStack>
                  {getConfidenceBadge(extractedData.confidence.amount)}
                </HStack>
              )}

              <Divider />

              {/* Date */}
              {extractedData.date && (
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color="gray.600">Date</Text>
                    <Text fontSize="md" fontWeight="semibold">
                      {new Date(extractedData.date).toLocaleDateString()}
                    </Text>
                  </VStack>
                  {getConfidenceBadge(extractedData.confidence.date)}
                </HStack>
              )}

              <Divider />

              {/* Vendor */}
              {extractedData.vendor && (
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color="gray.600">Vendor</Text>
                    <Text fontSize="md" fontWeight="semibold">
                      {extractedData.vendor}
                    </Text>
                  </VStack>
                  {getConfidenceBadge(extractedData.confidence.vendor)}
                </HStack>
              )}

              <Divider />

              {/* Category */}
              {extractedData.category && (
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color="gray.600">Suggested Category</Text>
                    <Text fontSize="md" fontWeight="semibold" color="blue.600">
                      {extractedData.category}
                    </Text>
                  </VStack>
                  <Badge colorScheme="blue" variant="outline">Auto</Badge>
                </HStack>
              )}
            </VStack>

            {/* Action Buttons */}
            <HStack space={3} justifyContent="center">
              <Button
                onPress={handleUseExtractedData}
                colorScheme="green"
                size="lg"
                borderRadius={20}
                flex={1}
                leftIcon={<Text>✨</Text>}
              >
                Use This Data
              </Button>
              <Button
                onPress={() => setShowResults(false)}
                variant="outline"
                colorScheme="gray"
                size="lg"
                borderRadius={20}
                flex={1}
              >
                Try Again
              </Button>
            </HStack>

            {/* Confidence Info */}
            <Box bg="blue.50" p={3} borderRadius={10}>
              <Text fontSize="xs" color="blue.700" textAlign="center">
                💡 Confidence levels indicate how sure we are about each field. 
                You can always edit the information in the expense form.
              </Text>
            </Box>
          </VStack>
        )}

        {/* Initial State */}
        {!isProcessing && !showResults && (
          <Box bg="gray.50" p={4} borderRadius={15}>
            <VStack space={2} alignItems="center">
              <Text fontSize="2xl">🤖</Text>
              <Text fontSize="md" fontWeight="semibold" textAlign="center">
                Smart Receipt Processing
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Let AI extract amount, date, vendor, and category from your receipt automatically.
              </Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}; 