import React, { useState } from 'react';
import { TouchableOpacity, ScrollView as RNScrollView } from 'react-native';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Download, FileText, Database, Calendar, Settings, Check } from '@tamagui/lucide-icons';
import { TimePeriod } from '../services/expenseService';
import { ExportOptions } from '../services/exportService';

// Props interface for the export modal
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  currentTimePeriod: TimePeriod;
}

// ExportModal: Provides UI for selecting export options
// Features: Time period selection, format choice, data inclusion options
export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  currentTimePeriod
}) => {
  // State for export options
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(currentTimePeriod);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Theme setup
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  const accentColor = '#3B82F6';

  // Handle export button press
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const options: ExportOptions = {
        timePeriod,
        includeAnalytics,
        includeCharts,
        format
      };
      
      await onExport(options);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset options when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimePeriod(currentTimePeriod);
      setFormat('csv');
      setIncludeAnalytics(true);
      setIncludeCharts(false);
      setIsExporting(false);
    }
  }, [isOpen, currentTimePeriod]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <RNView style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
      zIndex: 1000
    }}>
      <TouchableOpacity 
        style={{ flex: 1 }} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <View
        backgroundColor={bg}
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        padding="$4"
        maxHeight="85%"
      >
        <RNScrollView showsVerticalScrollIndicator={false}>
          <RNView style={{ gap: 24 }}>
            {/* Header */}
            <RNView style={{ alignItems: 'center', gap: 8 }}>
              <Download size={32} color={accentColor} />
              <Text fontSize="$6" fontWeight="600" color={primaryText}>
                Export Data
              </Text>
              <Text fontSize="$3" color={secondaryText} textAlign="center">
                Choose what data to export and in which format
              </Text>
            </RNView>

            {/* Separator */}
            <RNView style={{ height: 1, backgroundColor: border }} />

            {/* Time Period Selection */}
            <RNView style={{ gap: 16 }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} color={accentColor} />
                <Text fontSize="$4" fontWeight="600" color={primaryText}>
                  Time Period
                </Text>
              </RNView>
              
              <RNView style={{ gap: 12 }}>
                {[
                  { value: 'week', label: 'Last 7 days' },
                  { value: 'month', label: 'Last 30 days' },
                  { value: 'quarter', label: 'Last 3 months' },
                  { value: 'year', label: 'Last year' },
                  { value: 'all', label: 'All time' }
                ].map((period) => (
                  <TouchableOpacity
                    key={period.value}
                    onPress={() => setTimePeriod(period.value as TimePeriod)}
                  >
                    <RNView style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 12,
                      paddingVertical: 8
                    }}>
                      <RNView style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: timePeriod === period.value ? accentColor : border,
                        backgroundColor: timePeriod === period.value ? accentColor : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {timePeriod === period.value && (
                          <Check size={12} color="white" />
                        )}
                      </RNView>
                      <Text fontSize="$3" color={primaryText}>
                        {period.label}
                      </Text>
                    </RNView>
                  </TouchableOpacity>
                ))}
              </RNView>
            </RNView>

            {/* Separator */}
            <RNView style={{ height: 1, backgroundColor: border }} />

            {/* Format Selection */}
            <RNView style={{ gap: 16 }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileText size={20} color={accentColor} />
                <Text fontSize="$4" fontWeight="600" color={primaryText}>
                  Export Format
                </Text>
              </RNView>
              
              <RNView style={{ gap: 12 }}>
                {[
                  { 
                    value: 'csv', 
                    title: 'CSV (Spreadsheet)',
                    description: 'Best for Excel, Google Sheets, and data analysis'
                  },
                  { 
                    value: 'json', 
                    title: 'JSON (Data)',
                    description: 'Best for developers and data backup'
                  }
                ].map((formatOption) => (
                  <TouchableOpacity
                    key={formatOption.value}
                    onPress={() => setFormat(formatOption.value as 'csv' | 'json')}
                  >
                    <RNView style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 12,
                      paddingVertical: 8
                    }}>
                      <RNView style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: format === formatOption.value ? accentColor : border,
                        backgroundColor: format === formatOption.value ? accentColor : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {format === formatOption.value && (
                          <Check size={12} color="white" />
                        )}
                      </RNView>
                      <RNView style={{ flex: 1 }}>
                        <Text fontSize="$3" fontWeight="500" color={primaryText}>
                          {formatOption.title}
                        </Text>
                        <Text fontSize="$2" color={secondaryText}>
                          {formatOption.description}
                        </Text>
                      </RNView>
                    </RNView>
                  </TouchableOpacity>
                ))}
              </RNView>
            </RNView>

            {/* Separator */}
            <RNView style={{ height: 1, backgroundColor: border }} />

            {/* Data Options */}
            <RNView style={{ gap: 16 }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Settings size={20} color={accentColor} />
                <Text fontSize="$4" fontWeight="600" color={primaryText}>
                  Include Data
                </Text>
              </RNView>
              
              <RNView style={{ gap: 16 }}>
                <TouchableOpacity
                  onPress={() => setIncludeAnalytics(!includeAnalytics)}
                >
                  <RNView style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 12,
                    paddingVertical: 8
                  }}>
                    <RNView style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: includeAnalytics ? accentColor : border,
                      backgroundColor: includeAnalytics ? accentColor : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {includeAnalytics && (
                        <Check size={12} color="white" />
                      )}
                    </RNView>
                    <RNView style={{ flex: 1 }}>
                      <Text fontSize="$3" fontWeight="500" color={primaryText}>
                        Analytics & Summary
                      </Text>
                      <Text fontSize="$2" color={secondaryText}>
                        Category breakdowns, trends, and spending insights
                      </Text>
                    </RNView>
                  </RNView>
                </TouchableOpacity>
                
                {/* Charts option (disabled for now) */}
                <RNView style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 12,
                  paddingVertical: 8,
                  opacity: 0.5
                }}>
                  <RNView style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: border,
                    backgroundColor: 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Database size={12} color={secondaryText} />
                  </RNView>
                  <RNView style={{ flex: 1 }}>
                    <Text fontSize="$3" fontWeight="500" color={secondaryText}>
                      Chart Images (Coming Soon)
                    </Text>
                    <Text fontSize="$2" color={secondaryText}>
                      Export visual charts as images
                    </Text>
                  </RNView>
                </RNView>
              </RNView>
            </RNView>

            {/* Separator */}
            <RNView style={{ height: 1, backgroundColor: border }} />

            {/* Export Preview */}
            <View 
              padding="$3" 
              backgroundColor={cardBg} 
              borderRadius="$4"
              borderWidth={1}
              borderColor={border}
            >
              <Text fontSize="$3" fontWeight="600" color={primaryText} marginBottom="$2">
                Export Preview
              </Text>
              <Text fontSize="$2" color={secondaryText}>
                Format: {format.toUpperCase()}
              </Text>
              <Text fontSize="$2" color={secondaryText}>
                Period: {getTimePeriodLabel(timePeriod)}
              </Text>
              <Text fontSize="$2" color={secondaryText}>
                Includes: Expense data{includeAnalytics ? ', Analytics' : ''}
              </Text>
            </View>

            {/* Action Buttons */}
            <RNView style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={onClose}
                disabled={isExporting}
              >
                <View
                  paddingVertical="$4"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={border}
                  backgroundColor={cardBg}
                  alignItems="center"
                  opacity={isExporting ? 0.5 : 1}
                >
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flex: 2 }}
                onPress={handleExport}
                disabled={isExporting}
              >
                <View
                  paddingVertical="$4"
                  borderRadius="$4"
                  backgroundColor={accentColor}
                  alignItems="center"
                  opacity={isExporting ? 0.7 : 1}
                  flexDirection="row"
                  justifyContent="center"
                  gap="$2"
                >
                  {isExporting ? (
                    <Text fontSize="$3" fontWeight="600" color="white">
                      Exporting...
                    </Text>
                  ) : (
                    <>
                      <Download size={20} color="white" />
                      <Text fontSize="$3" fontWeight="600" color="white">
                        Export Data
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </RNView>
          </RNView>
        </RNScrollView>
      </View>
    </RNView>
  );
};

// Helper function to get readable time period labels
const getTimePeriodLabel = (period: TimePeriod): string => {
  switch (period) {
    case 'week': return 'Last 7 days';
    case 'month': return 'Last 30 days';
    case 'quarter': return 'Last 3 months';
    case 'year': return 'Last year';
    case 'all': return 'All time';
    default: return 'Custom';
  }
};

export default ExportModal; 