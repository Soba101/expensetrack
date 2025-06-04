import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import PieChart, { PieChartData } from '../components/charts/PieChart';
import LineChart, { LineChartDataPoint } from '../components/charts/LineChart';
import BarChart, { BarChartData } from '../components/charts/BarChart';
import { 
  getReportsAnalytics, 
  ReportsAnalytics, 
  TimePeriod,
  exportExpenseData 
} from '../services/expenseService';

// Tab options for different report views
type ReportTab = 'overview' | 'categories' | 'trends' | 'vendors';

// Time period options with display labels
const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' },
  { value: 'all', label: 'All Time' }
];

// ReportsScreen: Comprehensive analytics and reporting dashboard
// Features: Multiple chart types, time period filtering, export functionality, detailed insights
const ReportsScreen: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [analyticsData, setAnalyticsData] = useState<ReportsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme setup
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.color11?.val || '#64748B';
  const accentColor = '#3B82F6';
  const successColor = '#10B981';
  const warningColor = '#F59E0B';
  const errorColor = '#EF4444';

  // Load analytics data
  const loadAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getReportsAnalytics(timePeriod);
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount and when time period changes
  useEffect(() => {
    loadAnalytics();
  }, [timePeriod]);

  // Handle refresh
  const handleRefresh = () => {
    loadAnalytics(true);
  };

  // Handle export (placeholder for now)
  const handleExport = async () => {
    try {
      const csvData = await exportExpenseData(timePeriod);
      console.log('Export data:', csvData);
      // TODO: Implement actual file export using expo-file-system
      alert('Export functionality coming soon!');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  // Render time period selector
  const renderTimePeriodSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 16 }}
    >
      <RNView style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            key={period.value}
            onPress={() => setTimePeriod(period.value)}
          >
            <View
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius="$6"
              backgroundColor={timePeriod === period.value ? accentColor : cardBg}
              borderWidth={1}
              borderColor={timePeriod === period.value ? accentColor : border}
            >
              <Text
                fontSize="$3"
                fontWeight="600"
                color={timePeriod === period.value ? 'white' : primaryText}
              >
                {period.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </RNView>
    </ScrollView>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <RNView style={{ 
      flexDirection: 'row', 
      backgroundColor: cardBg,
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 16,
      marginBottom: 16
    }}>
      {[
        { key: 'overview', label: 'Overview', icon: 'analytics' },
        { key: 'categories', label: 'Categories', icon: 'pie-chart' },
        { key: 'trends', label: 'Trends', icon: 'trending-up' },
        { key: 'vendors', label: 'Vendors', icon: 'business' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1 }}
          onPress={() => setActiveTab(tab.key as ReportTab)}
        >
          <View
            paddingVertical="$3"
            borderRadius="$2"
            backgroundColor={activeTab === tab.key ? accentColor : 'transparent'}
            alignItems="center"
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? 'white' : secondaryText}
              style={{ marginBottom: 4 }}
            />
            <Text
              fontSize="$2"
              fontWeight="600"
              color={activeTab === tab.key ? 'white' : secondaryText}
            >
              {tab.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </RNView>
  );

  // Render summary cards
  const renderSummaryCards = () => {
    if (!analyticsData) return null;

    const { summary } = analyticsData;

    return (
      <RNView style={{ 
        flexDirection: 'row', 
        gap: 12, 
        marginHorizontal: 16, 
        marginBottom: 16 
      }}>
        <View
          flex={1}
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
        >
          <Text fontSize="$2" color={secondaryText} marginBottom="$2">
            Total Spent
          </Text>
          <Text fontSize="$6" fontWeight="700" color={primaryText}>
            ${summary.totalSpent.toLocaleString()}
          </Text>
        </View>

        <View
          flex={1}
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
        >
          <Text fontSize="$2" color={secondaryText} marginBottom="$2">
            Transactions
          </Text>
          <Text fontSize="$6" fontWeight="700" color={primaryText}>
            {summary.transactionCount}
          </Text>
        </View>
      </RNView>
    );
  };

  // Render overview tab content
  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    const { summary, categories } = analyticsData;

    // Prepare pie chart data
    const pieChartData: PieChartData[] = categories.slice(0, 6).map(cat => ({
      name: cat.name,
      value: cat.totalSpent,
      color: cat.color,
      percentage: cat.percentage
    }));

    return (
      <RNView style={{ gap: 16, paddingHorizontal: 16 }}>
        {/* Key Metrics */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Key Metrics
          </Text>
          
          <RNView style={{ gap: 12 }}>
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text fontSize="$3" color={secondaryText}>Average Transaction</Text>
              <Text fontSize="$3" fontWeight="600" color={primaryText}>
                ${summary.averageTransaction.toFixed(2)}
              </Text>
            </RNView>
            
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text fontSize="$3" color={secondaryText}>Top Category</Text>
              <Text fontSize="$3" fontWeight="600" color={primaryText}>
                {summary.topCategory}
              </Text>
            </RNView>
            
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text fontSize="$3" color={secondaryText}>Top Vendor</Text>
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
            borderWidth={1}
            borderColor={border}
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

  // Render categories tab content
  const renderCategoriesTab = () => {
    if (!analyticsData) return null;

    const { categories } = analyticsData;

    // Prepare bar chart data
    const barChartData: BarChartData[] = categories.slice(0, 8).map(cat => ({
      name: cat.name,
      value: cat.totalSpent,
      color: cat.color
    }));

    return (
      <RNView style={{ gap: 16, paddingHorizontal: 16 }}>
        {/* Category Comparison Chart */}
        {barChartData.length > 0 && (
          <View
            padding="$4"
            borderRadius="$4"
            backgroundColor={cardBg}
            borderWidth={1}
            borderColor={border}
          >
            <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
              Category Comparison
            </Text>
            <BarChart
              data={barChartData}
              height={300}
              orientation="horizontal"
              showValues={true}
            />
          </View>
        )}

        {/* Category Details */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
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
                  paddingVertical: 8,
                  borderBottomWidth: index < categories.length - 1 ? 1 : 0,
                  borderBottomColor: border
                }}
              >
                <RNView style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <RNView style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
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

  // Render trends tab content
  const renderTrendsTab = () => {
    if (!analyticsData) return null;

    const { trends } = analyticsData;

    // Prepare line chart data
    const lineChartData: LineChartDataPoint[] = trends.map(trend => ({
      date: trend.date,
      value: trend.amount,
      label: `$${trend.amount.toFixed(0)}`
    }));

    return (
      <RNView style={{ gap: 16, paddingHorizontal: 16 }}>
        {/* Spending Trends Chart */}
        {lineChartData.length > 0 && (
          <View
            padding="$4"
            borderRadius="$4"
            backgroundColor={cardBg}
            borderWidth={1}
            borderColor={border}
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
          borderWidth={1}
          borderColor={border}
        >
          <Text fontSize="$4" fontWeight="600" color={primaryText} marginBottom="$4">
            Trend Analysis
          </Text>
          
          {trends.length > 1 ? (
            <RNView style={{ gap: 12 }}>
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text fontSize="$3" color={secondaryText}>Highest Day</Text>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  ${Math.max(...trends.map(t => t.amount)).toFixed(0)}
                </Text>
              </RNView>
              
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text fontSize="$3" color={secondaryText}>Lowest Day</Text>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  ${Math.min(...trends.map(t => t.amount)).toFixed(0)}
                </Text>
              </RNView>
              
              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text fontSize="$3" color={secondaryText}>Average Daily</Text>
                <Text fontSize="$3" fontWeight="600" color={primaryText}>
                  ${(trends.reduce((sum, t) => sum + t.amount, 0) / trends.length).toFixed(0)}
                </Text>
              </RNView>
            </RNView>
          ) : (
            <Text fontSize="$3" color={secondaryText}>
              Not enough data for trend analysis
            </Text>
          )}
        </View>
      </RNView>
    );
  };

  // Render vendors tab content
  const renderVendorsTab = () => {
    if (!analyticsData) return null;

    const { vendors } = analyticsData;

    return (
      <RNView style={{ gap: 16, paddingHorizontal: 16 }}>
        {/* Top Vendors */}
        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={cardBg}
          borderWidth={1}
          borderColor={border}
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
                  paddingVertical: 8,
                  borderBottomWidth: index < vendors.length - 1 ? 1 : 0,
                  borderBottomColor: border
                }}
              >
                <RNView style={{ flex: 1 }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    {vendor.name}
                  </Text>
                  <Text fontSize="$2" color={secondaryText}>
                    {vendor.transactionCount} transactions • Avg: ${vendor.averageAmount.toFixed(0)}
                  </Text>
                  <Text fontSize="$2" color={secondaryText}>
                    Categories: {vendor.categories.join(', ')}
                  </Text>
                </RNView>
                
                <RNView style={{ alignItems: 'flex-end' }}>
                  <Text fontSize="$3" fontWeight="600" color={primaryText}>
                    ${vendor.totalSpent.toLocaleString()}
                  </Text>
                  <Text fontSize="$2" color={secondaryText}>
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

  // Loading state
  if (loading) {
    return (
      <View flex={1} backgroundColor={bg} alignItems="center" justifyContent="center">
        <Text fontSize="$4" color={primaryText}>Loading analytics...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View flex={1} backgroundColor={bg} alignItems="center" justifyContent="center" padding="$4">
        <Ionicons name="alert-circle" size={48} color={errorColor} />
        <Text fontSize="$4" fontWeight="600" color={errorColor} marginTop="$4" textAlign="center">
          Failed to Load Analytics
        </Text>
        <Text fontSize="$3" color={secondaryText} marginTop="$2" textAlign="center">
          {error}
        </Text>
        <TouchableOpacity onPress={() => loadAnalytics()}>
          <View
            marginTop="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderRadius="$3"
            backgroundColor={accentColor}
          >
            <Text fontSize="$3" fontWeight="600" color="white">
              Try Again
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text fontSize="$7" fontWeight="700" color={primaryText}>
          Reports & Analytics
        </Text>
        <TouchableOpacity onPress={handleExport}>
          <Ionicons name="download" size={24} color={accentColor} />
        </TouchableOpacity>
      </RNView>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={accentColor}
          />
        }
      >
        {/* Time Period Selector */}
        {renderTimePeriodSelector()}

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Tab Navigation */}
        {renderTabNavigation()}

        {/* Tab Content */}
        {renderTabContent()}

        {/* Bottom Spacing */}
        <RNView style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default ReportsScreen; 