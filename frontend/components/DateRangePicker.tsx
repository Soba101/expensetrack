import React, { useState } from 'react';
import { TouchableOpacity, ScrollView as RNScrollView, Alert } from 'react-native';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Calendar, ChevronDown, Check, X } from '@tamagui/lucide-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { CustomDateRange } from '../services/expenseService';

// Props interface for the date range picker
interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange: (range: CustomDateRange) => void;
  initialRange?: CustomDateRange;
}

// Preset date range options
interface PresetRange {
  label: string;
  description: string;
  getValue: () => CustomDateRange;
}

// DateRangePicker: Custom date range selection component
// Features: Preset ranges, manual date selection, validation, Apple-inspired design
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isOpen,
  onClose,
  onSelectRange,
  initialRange
}) => {
  // State management
  const [selectedRange, setSelectedRange] = useState<CustomDateRange>(
    initialRange || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Theme setup
  const theme = useTheme();
  const bg = '#F2F2F7';
  const cardBg = '#FFFFFF';
  const border = '#E5E5EA';
  const primaryText = '#000000';
  const secondaryText = '#8E8E93';
  const accentColor = '#007AFF';
  const successColor = '#34C759';
  const errorColor = '#FF3B30';

  // Preset date ranges
  const presetRanges: PresetRange[] = [
    {
      label: 'Last 7 Days',
      description: 'Past week',
      getValue: () => ({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
    },
    {
      label: 'Last 30 Days',
      description: 'Past month',
      getValue: () => ({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
    },
    {
      label: 'Last 90 Days',
      description: 'Past quarter',
      getValue: () => ({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
    },
    {
      label: 'This Month',
      description: 'Current calendar month',
      getValue: () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last Month',
      description: 'Previous calendar month',
      getValue: () => {
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: startOfLastMonth.toISOString().split('T')[0],
          endDate: endOfLastMonth.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'This Year',
      description: 'Current calendar year',
      getValue: () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return {
          startDate: startOfYear.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last Year',
      description: 'Previous calendar year',
      getValue: () => {
        const now = new Date();
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
        return {
          startDate: startOfLastYear.toISOString().split('T')[0],
          endDate: endOfLastYear.toISOString().split('T')[0]
        };
      }
    }
  ];

  // Handle preset selection
  const handlePresetSelect = async (preset: PresetRange, index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const range = preset.getValue();
    setSelectedRange(range);
    setSelectedPreset(preset.label);
  };

  // Handle manual date changes
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setSelectedRange(prev => ({ ...prev, startDate: dateString }));
      setSelectedPreset(null); // Clear preset selection when manually changing dates
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setSelectedRange(prev => ({ ...prev, endDate: dateString }));
      setSelectedPreset(null); // Clear preset selection when manually changing dates
    }
  };

  // Validate date range
  const validateRange = (): boolean => {
    const startDate = new Date(selectedRange.startDate);
    const endDate = new Date(selectedRange.endDate);
    const now = new Date();

    // Check if start date is after end date
    if (startDate > endDate) {
      Alert.alert('Invalid Range', 'Start date cannot be after end date.');
      return false;
    }

    // Check if end date is in the future
    if (endDate > now) {
      Alert.alert('Invalid Range', 'End date cannot be in the future.');
      return false;
    }

    // Check if range is too large (more than 2 years)
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 730) {
      Alert.alert('Range Too Large', 'Please select a range of 2 years or less for better performance.');
      return false;
    }

    return true;
  };

  // Handle apply button
  const handleApply = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (validateRange()) {
      onSelectRange(selectedRange);
      onClose();
    }
  };

  // Handle cancel button
  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate range duration
  const getRangeDuration = (): string => {
    const startDate = new Date(selectedRange.startDate);
    const endDate = new Date(selectedRange.endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) return '1 day';
    if (daysDiff < 30) return `${daysDiff} days`;
    if (daysDiff < 365) return `${Math.round(daysDiff / 30)} months`;
    return `${Math.round(daysDiff / 365)} years`;
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.5)"
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
    >
      <View
        backgroundColor={cardBg}
        borderRadius="$6"
        padding="$0"
        width="90%"
        maxWidth={400}
        maxHeight="80%"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 10 }}
        shadowOpacity={0.25}
        shadowRadius={20}
      >
        {/* Header */}
        <RNView style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: border
        }}>
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} color={accentColor} />
            <Text fontSize="$5" fontWeight="600" color={primaryText}>
              Select Date Range
            </Text>
          </RNView>
          <TouchableOpacity onPress={handleCancel}>
            <X size={20} color={secondaryText} />
          </TouchableOpacity>
        </RNView>

        <RNScrollView style={{ maxHeight: 400 }}>
          {/* Preset Ranges */}
          <RNView style={{ padding: 20 }}>
            <Text fontSize="$4" fontWeight="600" color={primaryText} style={{ marginBottom: 12 }}>
              Quick Select
            </Text>
            <RNView style={{ gap: 8 }}>
              {presetRanges.map((preset, index) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => handlePresetSelect(preset, index)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    backgroundColor: selectedPreset === preset.label ? `${accentColor}15` : 'transparent',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selectedPreset === preset.label ? accentColor : border
                  }}
                >
                  <RNView>
                    <Text fontSize="$3" fontWeight="500" color={primaryText}>
                      {preset.label}
                    </Text>
                    <Text fontSize="$2" color={secondaryText}>
                      {preset.description}
                    </Text>
                  </RNView>
                  {selectedPreset === preset.label && (
                    <Check size={16} color={accentColor} />
                  )}
                </TouchableOpacity>
              ))}
            </RNView>
          </RNView>

          {/* Manual Date Selection */}
          <RNView style={{ 
            padding: 20, 
            borderTopWidth: 1, 
            borderTopColor: border 
          }}>
            <Text fontSize="$4" fontWeight="600" color={primaryText} style={{ marginBottom: 12 }}>
              Custom Range
            </Text>
            
            {/* Start Date */}
            <RNView style={{ marginBottom: 16 }}>
              <Text fontSize="$3" fontWeight="500" color={primaryText} style={{ marginBottom: 8 }}>
                Start Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  backgroundColor: bg,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: border
                }}
              >
                <Text fontSize="$3" color={primaryText}>
                  {formatDate(selectedRange.startDate)}
                </Text>
                <ChevronDown size={16} color={secondaryText} />
              </TouchableOpacity>
            </RNView>

            {/* End Date */}
            <RNView style={{ marginBottom: 16 }}>
              <Text fontSize="$3" fontWeight="500" color={primaryText} style={{ marginBottom: 8 }}>
                End Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  backgroundColor: bg,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: border
                }}
              >
                <Text fontSize="$3" color={primaryText}>
                  {formatDate(selectedRange.endDate)}
                </Text>
                <ChevronDown size={16} color={secondaryText} />
              </TouchableOpacity>
            </RNView>

            {/* Range Summary */}
            <RNView style={{
              padding: 12,
              backgroundColor: `${successColor}15`,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: `${successColor}30`
            }}>
              <Text fontSize="$2" color={successColor} style={{ textAlign: 'center' }}>
                Duration: {getRangeDuration()}
              </Text>
            </RNView>
          </RNView>
        </RNScrollView>

        {/* Footer Buttons */}
        <RNView style={{
          flexDirection: 'row',
          gap: 12,
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: border
        }}>
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: bg,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text fontSize="$3" fontWeight="500" color={secondaryText}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: accentColor,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text fontSize="$3" fontWeight="600" color="white">
              Apply Range
            </Text>
          </TouchableOpacity>
        </RNView>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={new Date(selectedRange.startDate)}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={new Date(selectedRange.endDate)}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(selectedRange.startDate)}
          />
        )}
      </View>
    </View>
  );
};

export default DateRangePicker; 