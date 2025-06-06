import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, RefreshControl, Alert, Text as RNText } from 'react-native';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import PieChart, { PieChartData } from '../components/charts/PieChart';
import LineChart, { LineChartDataPoint } from '../components/charts/LineChart';
import BarChart, { BarChartData } from '../components/charts/BarChart';
import ExportModal from '../components/ExportModal';
import DateRangePicker from '../components/DateRangePicker';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { 
  getReportsAnalytics, 
  ReportsAnalytics, 
  TimePeriod,
  CustomDateRange
} from '../services/expenseService';
import exportService, { ExportOptions, ExportResult } from '../services/exportService';

// Define the navigation stack type
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: { expenseId: string };
  ExpensesList: undefined;
  AddEditExpense: { expenseId?: string } | undefined;
  Categories: undefined;
  Reports: undefined;
  Profile: undefined;
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reports'>;

// Tab options for different report views
type ReportTab = 'overview' | 'categories' | 'trends' | 'vendors';

// Time period options with display labels
const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' }
];

// ReportsScreen: Comprehensive analytics and reporting dashboard
// Features: Multiple chart types, time period filtering, export functionality, detailed insights
// Enhanced with Apple-inspired design, skeleton loading, empty states, and haptic feedback
const ReportsScreen: React.FC = () => {
  // Navigation and toast
  const navigation = useNavigation<NavigationProp>();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ReportsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // Theme setup with enhanced colors
  const theme = useTheme();
  const bg = '#F2F2F7'; // iOS background
  const cardBg = '#FFFFFF';
  const border = '#E5E5EA';
  const primaryText = '#000000';
  const secondaryText = '#8E8E93';
  const accentColor = '#007AFF';
  const successColor = '#34C759';
  const warningColor = '#FF9500';
  const errorColor = '#FF3B30';

  // Load analytics data with enhanced error handling
  const loadAnalytics = useCallback(async (showRefresh = false) => {
    try {
      console.log('🔄 loadAnalytics called - timePeriod:', timePeriod, 'customDateRange:', customDateRange, 'showRefresh:', showRefresh);
      
      if (showRefresh) {
        setRefreshing(true);
        // Haptic feedback for refresh
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setLoading(true);
      }
      setError(null);

      // Pass custom date range if using custom time period
      const data = await getReportsAnalytics(
        timePeriod, 
        timePeriod === 'custom' ? customDateRange || undefined : undefined
      );
      console.log('✅ Analytics data loaded successfully:', {
        timePeriod,
        transactionCount: data.summary.transactionCount,
        totalSpent: data.summary.totalSpent
      });
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      const errorMessage = err.message || 'Failed to load analytics data';
      setError(errorMessage);
      showErrorToast('Failed to load analytics', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timePeriod, customDateRange]);

  // Load data on component mount and when time period changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - timePeriod:', timePeriod, 'customDateRange:', customDateRange);
    loadAnalytics();
  }, [timePeriod, customDateRange]);

  // Handle refresh with haptic feedback
  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadAnalytics(true);
  };

  // Handle back navigation
  const handleBack = async () => {
    console.log('🔙 Back button pressed');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.goBack();
    } catch (error) {
      console.error('Back navigation error:', error);
      navigation.goBack();
    }
  };

  // Handle export button press with haptic feedback
  const handleExport = async () => {
    console.log('📤 Export button pressed');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowExportModal(true);
    } catch (error) {
      console.error('Export button error:', error);
      setShowExportModal(true);
    }
  };

  // Handle actual export process from modal
  const handleExportData = async (options: ExportOptions): Promise<void> => {
    try {
      console.log('🔄 Starting export with options:', options);
      
      const result: ExportResult = await exportService.exportExpenseData(options);
      
      if (result.success) {
        console.log('✅ Export successful:', result.fileName);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast('Export Successful', `File: ${result.fileName}`);
        // Show success message for mock export
        Alert.alert(
          'Export Successful',
          `File: ${result.fileName}\n\nNote: This is a demo version. In a production build, the file would be saved and shared. Check the console for the generated data.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        console.error('❌ Export failed:', result.error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showErrorToast('Export Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Export error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showErrorToast('Export Failed', error.message || 'Unknown error');
    }
  };

  // Handle tab change with haptic feedback
  const handleTabChange = async (tab: ReportTab) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Handle time period change with haptic feedback
  const handleTimePeriodChange = async (period: TimePeriod) => {
    console.log('🔄 handleTimePeriodChange called with period:', period);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (period === 'custom') {
      // Show date range picker for custom selection
      setShowDateRangePicker(true);
    } else {
      // Clear custom date range when switching to predefined periods
      setCustomDateRange(null);
      setTimePeriod(period);
      console.log('🔄 Set timePeriod to:', period);
    }
  };

  // Handle custom date range selection
  const handleCustomDateRangeSelect = async (range: CustomDateRange) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomDateRange(range);
    setTimePeriod('custom');
    setShowDateRangePicker(false);
  };

  // Render skeleton loading for summary cards
  const renderSummaryCardsSkeleton = () => (
    <RNView style={{ 
      flexDirection: 'row', 
      gap: 12, 
      marginHorizontal: 16, 
      marginBottom: 16 
    }}>
      <SkeletonLoader width="48%" height={80} borderRadius={12} />
      <SkeletonLoader width="48%" height={80} borderRadius={12} />
    </RNView>
  );

  // Render skeleton loading for charts
  const renderChartSkeleton = () => (
    <RNView style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <SkeletonLoader width="100%" height={300} borderRadius={12} />
    </RNView>
  );

  // Render empty state component
  const renderEmptyState = (title: string, message: string, icon: string) => (
    <View
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$6"
      marginTop="$8"
    >
      <View
        width={80}
        height={80}
        borderRadius={40}
        backgroundColor="#F2F2F7"
        alignItems="center"
        justifyContent="center"
        marginBottom="$4"
      >
        <Ionicons name={icon as any} size={40} color={secondaryText} />
      </View>
      <Text fontSize="$5" fontWeight="600" color={primaryText} textAlign="center" marginBottom="$2">
        {title}
      </Text>
      <Text fontSize="$3" color={secondaryText} textAlign="center" lineHeight="$4">
        {message}
      </Text>
    </View>
  );

  // Render enhanced time period selector
  const renderTimePeriodSelector = () => {
    // Helper function to get display label for current selection
    const getCurrentPeriodLabel = () => {
      if (timePeriod === 'custom' && customDateRange) {
        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
      const period = TIME_PERIODS.find(p => p.value === timePeriod);
      return period?.label || 'Unknown';
    };

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <RNView style={{ flexDirection: 'row', gap: 8 }}>
          {TIME_PERIODS.map((period) => {
            const isSelected = timePeriod === period.value;
            const isCustomSelected = period.value === 'custom' && timePeriod === 'custom';
            
            return (
              <TouchableOpacity
                key={period.value}
                onPress={() => {
                  console.log('🔄 TouchableOpacity pressed for period:', period.value);
                  handleTimePeriodChange(period.value);
                }}
                activeOpacity={0.7}
              >
                <View
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  borderRadius="$8"
                  backgroundColor={isSelected ? accentColor : cardBg}
                  borderWidth={1}
                  borderColor={isSelected ? accentColor : border}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  minWidth={isCustomSelected ? 140 : 'auto'}
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={isSelected ? 'white' : primaryText}
                    textAlign="center"
                  >
                    {isCustomSelected ? getCurrentPeriodLabel() : period.label}
                  </Text>
                  {isCustomSelected && (
                    <Text
                      fontSize="$1"
                      color={isSelected ? 'rgba(255,255,255,0.8)' : secondaryText}
                      textAlign="center"
                      marginTop="$1"
                    >
                      Custom Range
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </RNView>
      </ScrollView>
    );
  };

  // Render enhanced tab navigation with 1x4 small square icons
  const renderTabNavigation = () => {
    const tabs = [
      { key: 'overview', label: 'Overview', icon: 'analytics', bgColor: '#E3F2FD', iconColor: '#1976D2' },
      { key: 'categories', label: 'Categories', icon: 'pie-chart', bgColor: '#FFF3E0', iconColor: '#F57C00' },
      { key: 'trends', label: 'Trends', icon: 'trending-up', bgColor: '#E8F5E8', iconColor: '#388E3C' },
      { key: 'vendors', label: 'Vendors', icon: 'business', bgColor: '#F3E5F5', iconColor: '#7B1FA2' }
    ];

    return (
      <RNView style={{ 
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 24,
        justifyContent: 'space-between'
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab.key as ReportTab);
            }}
            activeOpacity={0.7}
            style={{ alignItems: 'center' }}
          >
            {/* Square icon container */}
            <View
              width={72}
              height={72}
              borderRadius={20}
              backgroundColor={activeTab === tab.key ? accentColor : cardBg}
              alignItems="center"
              justifyContent="center"
              marginBottom="$2"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={activeTab === tab.key ? 0.15 : 0.08}
              shadowRadius={8}
              borderWidth={activeTab === tab.key ? 0 : 1}
              borderColor={activeTab === tab.key ? 'transparent' : border}
            >
              <Ionicons
                name={tab.icon as any}
                size={32}
                color={activeTab === tab.key ? 'white' : tab.iconColor}
              />
            </View>
            
            {/* Label */}
            <Text
              fontSize="$2"
              fontWeight="600"
              color={activeTab === tab.key ? accentColor : secondaryText}
              textAlign="center"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </RNView>
    );
  };

  // Render enhanced summary cards with icons
  const renderSummaryCards = () => {
    if (!analyticsData) return renderSummaryCardsSkeleton();

    const { summary } = analyticsData;

    return (
      <RNView style={{ 
        flexDirection: 'row', 
        gap: 12, 
        marginHorizontal: 16, 
        marginBottom: 20 
      }}>
        <View
          flex={1}
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="#E3F2FD"
              alignItems="center"
              justifyContent="center"
              marginRight="$3"
            >
              <Ionicons name="wallet" size={16} color={accentColor} />
            </View>
            <Text fontSize="$2" color={secondaryText} fontWeight="500">
              Total Spent
            </Text>
          </RNView>
          <Text fontSize="$6" fontWeight="700" color={primaryText}>
            ${summary.totalSpent.toLocaleString()}
          </Text>
        </View>

        <View
          flex={1}
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="#E8F5E8"
              alignItems="center"
              justifyContent="center"
              marginRight="$3"
            >
              <Ionicons name="receipt" size={16} color={successColor} />
            </View>
            <Text fontSize="$2" color={secondaryText} fontWeight="500">
              Transactions
            </Text>
          </RNView>
          <Text fontSize="$6" fontWeight="700" color={primaryText}>
            {summary.transactionCount}
          </Text>
        </View>
      </RNView>
    );
  };

  // Render overview tab content with enhanced styling
  const renderOverviewTab = () => {
    if (!analyticsData) return renderChartSkeleton();

    const { summary, categories } = analyticsData;

    // Check for empty data
    if (categories.length === 0) {
      return renderEmptyState(
        'No Data Available',
        'Start adding expenses to see your spending overview and analytics.',
        'analytics-outline'
      );
    }

    // Prepare pie chart data
    const pieChartData: PieChartData[] = categories.slice(0, 6).map(cat => ({
      name: cat.name,
      value: cat.totalSpent,
      color: cat.color,
      percentage: cat.percentage
    }));

    return (
      <RNView style={{ gap: 20, paddingHorizontal: 16 }}>
        {/* Key Metrics */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Key Metrics
          </Text>
          
          <RNView style={{ gap: 16 }}>
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="#FFF3E0"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$3"
                >
                  <Ionicons name="calculator" size={12} color={warningColor} />
                </View>
                <Text fontSize="$3" color={secondaryText}>Average Transaction</Text>
              </RNView>
              <Text fontSize="$3" fontWeight="600" color={primaryText}>
                ${summary.averageTransaction.toFixed(2)}
              </Text>
            </RNView>
            
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="#E3F2FD"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$3"
                >
                  <Ionicons name="trophy" size={12} color={accentColor} />
                </View>
                <Text fontSize="$3" color={secondaryText}>Top Category</Text>
              </RNView>
              <Text fontSize="$3" fontWeight="600" color={primaryText}>
                {summary.topCategory}
              </Text>
            </RNView>
            
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="#E8F5E8"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$3"
                >
                  <Ionicons name="storefront" size={12} color={successColor} />
                </View>
                <Text fontSize="$3" color={secondaryText}>Top Vendor</Text>
              </RNView>
              <Text fontSize="$3" fontWeight="600" color={primaryText}>
                {summary.topVendor}
              </Text>
            </RNView>
          </RNView>
        </View>

        {/* Category Breakdown */}
        {pieChartData.length > 0 && (
          <View
            padding="$4"
            borderRadius="$4"
            backgroundColor={cardBg}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
          >
            <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
              Spending by Category
            </Text>
            <PieChart
              data={pieChartData}
              size={250}
              showLabels={true}
              showLegend={true}
            />
          </View>
        )}
      </RNView>
    );
  };

  // Render categories tab content with enhanced styling
  const renderCategoriesTab = () => {
    if (!analyticsData) return renderChartSkeleton();

    const { categories } = analyticsData;

    // Prepare bar chart data
    const barChartData: BarChartData[] = categories.slice(0, 8).map(cat => ({
      name: cat.name,
      value: cat.totalSpent,
      color: cat.color
    }));

    console.log('Categories Tab - Data:', { 
      categoriesLength: categories.length, 
      barChartDataLength: barChartData.length,
      categories: categories.map(c => ({ name: c.name, amount: c.totalSpent }))
    });

    // Check for empty data - show empty state if no real data
    if (barChartData.length === 0) {
      return renderEmptyState(
        'No Categories Found',
        'Add some expenses with categories to see detailed category analysis.',
        'pie-chart-outline'
      );
    }

    return (
      <RNView style={{ gap: 20, paddingHorizontal: 16 }}>
        {/* Category Comparison Chart */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Category Comparison
          </Text>
          <RNView style={{ alignItems: 'center' }}>
            <BarChart
              data={barChartData}
              width={400}
              height={320}
              orientation="horizontal"
              showValues={true}
            />
          </RNView>
        </View>

        {/* Category Details */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Category Details
          </Text>
          
          <RNView style={{ gap: 12 }}>
            {categories.slice(0, 10).map((category, index) => (
              <RNView 
                key={category.name}
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < categories.length - 1 ? 1 : 0,
                  borderBottomColor: border
                }}
              >
                <RNView style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <RNView style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: category.color,
                    marginRight: 12
                  }} />
                  <RNView style={{ flex: 1 }}>
                    <Text fontSize="$3" fontWeight="600" color={primaryText}>
                      {category.name}
                    </Text>
                    <Text fontSize="$2" color={secondaryText}>
                      {category.transactionCount} transactions
                    </Text>
                  </RNView>
                </RNView>
                
                <RNView style={{ alignItems: 'flex-end' }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    ${category.totalSpent.toLocaleString()}
                  </Text>
                  <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={
                        category.trend === 'up' ? 'trending-up' :
                        category.trend === 'down' ? 'trending-down' : 'remove'
                      }
                      size={12}
                      color={
                        category.trend === 'up' ? errorColor :
                        category.trend === 'down' ? successColor : secondaryText
                      }
                      style={{ marginRight: 4 }}
                    />
                    <Text fontSize="$2" color={secondaryText}>
                      {category.percentage.toFixed(1)}%
                    </Text>
                  </RNView>
                </RNView>
              </RNView>
            ))}
          </RNView>
        </View>
      </RNView>
    );
  };

  // Render trends tab content with enhanced styling
  const renderTrendsTab = () => {
    if (!analyticsData) return renderChartSkeleton();

    const { trends } = analyticsData;

    // Check for empty data
    if (trends.length === 0) {
      return renderEmptyState(
        'No Trend Data',
        'Add more expenses over time to see spending trends and patterns.',
        'trending-up-outline'
      );
    }

    // Prepare line chart data
    const lineChartData: LineChartDataPoint[] = trends.map(trend => ({
      date: trend.date,
      value: trend.amount,
      label: `$${trend.amount.toFixed(0)}`
    }));

    return (
      <RNView style={{ gap: 20, paddingHorizontal: 16 }}>
        {/* Spending Trends Chart */}
        {lineChartData.length > 0 && (
          <View
            padding="$4"
            borderRadius="$4"
            backgroundColor={cardBg}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
          >
            <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
              Spending Trends
            </Text>
            <LineChart
              data={lineChartData}
              height={250}
              showDots={true}
              showGrid={true}
              lineColor={accentColor}
            />
          </View>
        )}

        {/* Trend Analysis */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Trend Analysis
          </Text>
          
          {trends.length > 1 ? (
            <RNView style={{ gap: 16 }}>
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    width={24}
                    height={24}
                    borderRadius={12}
                    backgroundColor="#FFEBEE"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="$3"
                  >
                    <Ionicons name="arrow-up" size={12} color={errorColor} />
                  </View>
                  <Text fontSize="$3" color={secondaryText}>Highest Day</Text>
                </RNView>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  ${Math.max(...trends.map(t => t.amount)).toFixed(0)}
                </Text>
              </RNView>
              
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    width={24}
                    height={24}
                    borderRadius={12}
                    backgroundColor="#E8F5E8"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="$3"
                  >
                    <Ionicons name="arrow-down" size={12} color={successColor} />
                  </View>
                  <Text fontSize="$3" color={secondaryText}>Lowest Day</Text>
                </RNView>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  ${Math.min(...trends.map(t => t.amount)).toFixed(0)}
                </Text>
              </RNView>
              
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    width={24}
                    height={24}
                    borderRadius={12}
                    backgroundColor="#E3F2FD"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="$3"
                  >
                    <Ionicons name="calculator" size={12} color={accentColor} />
                  </View>
                  <Text fontSize="$3" color={secondaryText}>Average Daily</Text>
                </RNView>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  ${(trends.reduce((sum, t) => sum + t.amount, 0) / trends.length).toFixed(0)}
                </Text>
              </RNView>
            </RNView>
          ) : (
            <Text fontSize="$3" color={secondaryText} textAlign="center" marginTop="$4">
              Not enough data for trend analysis
            </Text>
          )}
        </View>
      </RNView>
    );
  };

  // Render vendors tab content with enhanced styling
  const renderVendorsTab = () => {
    if (!analyticsData) return renderChartSkeleton();

    const { vendors } = analyticsData;

    // Check for empty data
    if (vendors.length === 0) {
      return renderEmptyState(
        'No Vendor Data',
        'Add expenses with vendor information to see detailed vendor analysis.',
        'business-outline'
      );
    }

    return (
      <RNView style={{ gap: 20, paddingHorizontal: 16 }}>
        {/* Top Vendors */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Top Vendors
          </Text>
          
          <RNView style={{ gap: 12 }}>
            {vendors.slice(0, 10).map((vendor, index) => (
              <RNView 
                key={vendor.name}
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < vendors.length - 1 ? 1 : 0,
                  borderBottomColor: border
                }}
              >
                <RNView style={{ flex: 1 }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    {vendor.name}
                  </Text>
                  <Text fontSize="$2" color={secondaryText} marginTop={2}>
                    {vendor.transactionCount} transactions • Avg: ${vendor.averageAmount.toFixed(0)}
                  </Text>
                  <Text fontSize="$2" color={secondaryText} marginTop={2}>
                    Categories: {vendor.categories.join(', ')}
                  </Text>
                </RNView>
                
                <RNView style={{ alignItems: 'flex-end' }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    ${vendor.totalSpent.toLocaleString()}
                  </Text>
                  <Text fontSize="$2" color={secondaryText} marginTop={2}>
                    Last: {new Date(vendor.lastTransaction).toLocaleDateString()}
                  </Text>
                </RNView>
              </RNView>
            ))}
          </RNView>
        </View>
      </RNView>
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'categories':
        return renderCategoriesTab();
      case 'trends':
        return renderTrendsTab();
      case 'vendors':
        return renderVendorsTab();
      default:
        return renderOverviewTab();
    }
  };

  // Enhanced loading state with skeleton
  if (loading) {
    return (
      <View flex={1} backgroundColor={bg}>
        {/* Header Skeleton */}
        <RNView style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 64,
          paddingBottom: 16
        }}>
          <SkeletonLoader width={200} height={32} borderRadius={8} />
          <SkeletonLoader width={24} height={24} borderRadius={12} />
        </RNView>

        <ScrollView>
          {/* Time Period Selector Skeleton */}
          <RNView style={{ marginBottom: 20, paddingHorizontal: 16 }}>
            <RNView style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonLoader key={i} width={100} height={40} borderRadius={20} />
              ))}
            </RNView>
          </RNView>

          {/* Summary Cards Skeleton */}
          {renderSummaryCardsSkeleton()}

          {/* Tab Navigation Skeleton */}
          <RNView style={{ marginHorizontal: 16, marginBottom: 20 }}>
            <SkeletonLoader width="100%" height={60} borderRadius={16} />
          </RNView>

          {/* Content Skeleton */}
          {renderChartSkeleton()}
          {renderChartSkeleton()}
        </ScrollView>
      </View>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <View flex={1} backgroundColor={bg}>
        {/* Header */}
        <RNView style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 64,
          paddingBottom: 16
        }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
            <Ionicons name="chevron-back" size={24} color={accentColor} />
          </TouchableOpacity>
          <Text fontSize="$6" fontWeight="700" color={primaryText} flex={1}>
            Reports & Analytics
          </Text>
        </RNView>

        <View flex={1} alignItems="center" justifyContent="center" padding="$6">
          <View
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="#FFEBEE"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <Ionicons name="alert-circle" size={40} color={errorColor} />
          </View>
          <Text fontSize="$5" fontWeight="600" color={errorColor} textAlign="center" marginBottom="$2">
            Failed to Load Analytics
          </Text>
          <Text fontSize="$3" color={secondaryText} textAlign="center" lineHeight="$4" marginBottom="$6">
            {error}
          </Text>
          <TouchableOpacity onPress={() => loadAnalytics()} activeOpacity={0.7}>
            <View
              paddingHorizontal="$6"
              paddingVertical="$3"
              borderRadius="$6"
              backgroundColor={accentColor}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
            >
              <Text fontSize="$3" fontWeight="600" color="white">
                Try Again
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={bg}>
      {/* Enhanced Header with Back Navigation */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        {/* Back Button Row */}
        <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </TouchableOpacity>
        </RNView>

        {/* Title and Export Button Row */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <RNView style={{ flex: 1 }}>
            <Text fontSize={34} fontWeight="bold" color="#000000" marginBottom={4}>
              Reports & Analytics
            </Text>
            <Text fontSize={17} color="#8E8E93" fontWeight="400">
              {analyticsData ? `${analyticsData.summary.transactionCount} transactions analyzed` : 'Loading analytics...'}
            </Text>
          </RNView>
          
          {/* Export Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowExportModal(true);
            }}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="download" size={16} color="white" />
            <Text color="white" fontWeight="600">Export</Text>
          </TouchableOpacity>
        </RNView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={accentColor}
            colors={[accentColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Selector */}
        {renderTimePeriodSelector()}

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Tab Navigation */}
        {renderTabNavigation()}

        {/* Tab Content */}
        {renderTabContent()}

        {/* Bottom Spacing for Safe Area */}
        <RNView style={{ height: 40 }} />
      </ScrollView>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportData}
        currentTimePeriod={timePeriod}
        customDateRange={customDateRange}
      />

      {/* Custom Date Range Picker */}
      <DateRangePicker
        isOpen={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        onSelectRange={handleCustomDateRangeSelect}
        initialRange={customDateRange || undefined}
      />
    </View>
  );
};

export default ReportsScreen; 