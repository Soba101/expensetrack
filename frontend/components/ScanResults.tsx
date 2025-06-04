import React from 'react';
import { View as RNView, TouchableOpacity, ScrollView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseData } from '../context/ExpenseDataContext';

// ScanResults component shows recent OCR scans and their processing status
// Features: Recent scans list, processing status, quick edit options
const ScanResults: React.FC = () => {
  const { summaryData, loading } = useExpenseData();
  const theme = useTheme();

  // Theme colors
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';

  // Mock recent scans data (in real app, this would come from API)
  const recentScans = [
    {
      id: '1',
      merchant: 'Starbucks Coffee',
      amount: 12.45,
      date: '2024-01-15',
      status: 'processed',
      confidence: 95,
      category: 'Food & Dining',
      hasReceipt: true,
    },
    {
      id: '2', 
      merchant: 'Shell Gas Station',
      amount: 45.20,
      date: '2024-01-14',
      status: 'processing',
      confidence: 88,
      category: 'Transportation',
      hasReceipt: true,
    },
    {
      id: '3',
      merchant: 'Target Store',
      amount: 67.89,
      date: '2024-01-13',
      status: 'needs_review',
      confidence: 72,
      category: 'Shopping',
      hasReceipt: true,
    },
  ];

  // Get status color and icon
  const getStatusInfo = (status: string, confidence: number) => {
    switch (status) {
      case 'processed':
        return {
          color: '#10B981',
          bgColor: '#D1FAE5',
          icon: 'checkmark-circle',
          text: 'Processed',
        };
      case 'processing':
        return {
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          icon: 'time',
          text: 'Processing...',
        };
      case 'needs_review':
        return {
          color: '#EF4444',
          bgColor: '#FEE2E2',
          icon: 'warning',
          text: 'Needs Review',
        };
      default:
        return {
          color: '#6B7280',
          bgColor: '#F3F4F6',
          icon: 'help-circle',
          text: 'Unknown',
        };
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View marginBottom="$4">
        <Text fontSize="$5" fontWeight="600" color={primaryText} marginBottom="$3">
          Recent Scans
        </Text>
        <RNView style={{ gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              padding="$4"
              borderRadius="$5"
              backgroundColor={cardBg}
              borderWidth={1}
              borderColor={border}
            >
              <View
                height={20}
                backgroundColor="#E5E7EB"
                borderRadius="$2"
                marginBottom="$2"
              />
              <View
                height={16}
                width="60%"
                backgroundColor="#E5E7EB"
                borderRadius="$2"
              />
            </View>
          ))}
        </RNView>
      </View>
    );
  }

  return (
    <View marginBottom="$4">
      <RNView style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12 
      }}>
        <Text fontSize="$5" fontWeight="600" color={primaryText}>
          Recent Scans
        </Text>
        <TouchableOpacity>
          <Text fontSize="$3" color="#3B82F6" fontWeight="500">
            View All
          </Text>
        </TouchableOpacity>
      </RNView>

      <RNView style={{ gap: 12 }}>
        {recentScans.map((scan) => {
          const statusInfo = getStatusInfo(scan.status, scan.confidence);
          
          return (
            <TouchableOpacity key={scan.id}>
              <View
                padding="$4"
                borderRadius="$5"
                backgroundColor={cardBg}
                borderWidth={1}
                borderColor={border}
              >
                <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {/* Receipt Icon */}
                  <View
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="#EBF8FF"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons name="receipt" size={20} color="#3B82F6" />
                  </View>

                  {/* Scan Details */}
                  <RNView style={{ flex: 1, gap: 4 }}>
                    <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text fontSize="$4" fontWeight="600" color={primaryText}>
                        {scan.merchant}
                      </Text>
                      <Text fontSize="$4" fontWeight="700" color={primaryText}>
                        ${scan.amount.toFixed(2)}
                      </Text>
                    </RNView>
                    
                    <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text fontSize="$2" color={secondaryText}>
                        {scan.category} • {new Date(scan.date).toLocaleDateString()}
                      </Text>
                      
                      {/* Status Badge */}
                      <RNView style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 4,
                        backgroundColor: statusInfo.bgColor,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}>
                        <Ionicons 
                          name={statusInfo.icon as keyof typeof Ionicons.glyphMap} 
                          size={12} 
                          color={statusInfo.color} 
                        />
                        <Text fontSize="$1" color={statusInfo.color} fontWeight="600">
                          {statusInfo.text}
                        </Text>
                      </RNView>
                    </RNView>

                    {/* Confidence Score */}
                    {scan.status !== 'processed' && (
                      <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text fontSize="$2" color={secondaryText}>
                          Confidence: {scan.confidence}%
                        </Text>
                        <View
                          height={4}
                          flex={1}
                          backgroundColor="#E5E7EB"
                          borderRadius="$1"
                          overflow="hidden"
                        >
                          <View
                            height="100%"
                            width={`${scan.confidence}%`}
                            backgroundColor={scan.confidence > 80 ? '#10B981' : scan.confidence > 60 ? '#F59E0B' : '#EF4444'}
                          />
                        </View>
                      </RNView>
                    )}
                  </RNView>

                  {/* Action Arrow */}
                  <Ionicons name="chevron-forward" size={16} color={secondaryText} />
                </RNView>
              </View>
            </TouchableOpacity>
          );
        })}
      </RNView>

      {/* Empty State */}
      {recentScans.length === 0 && (
        <View
          padding="$6"
          borderRadius="$5"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="receipt-outline" size={48} color={secondaryText} />
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginTop="$3">
            No scans yet
          </Text>
          <Text fontSize="$3" color={secondaryText} textAlign="center" marginTop="$2">
            Start by scanning your first receipt above
          </Text>
        </View>
      )}
    </View>
  );
};

export default ScanResults; 