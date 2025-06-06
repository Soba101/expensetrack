// Mock export service for Expo Go compatibility
// This version doesn't use native modules that require development builds

import { 
  getReportsAnalytics, 
  getExpenses, 
  TimePeriod,
  ReportsAnalytics,
  CustomDateRange 
} from './expenseService';

// Interface for export options
export interface ExportOptions {
  timePeriod: TimePeriod;
  includeAnalytics: boolean;
  includeCharts: boolean;
  format: 'csv' | 'json';
  customRange?: CustomDateRange;
}

// Interface for export result
export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

// Mock ExportService for Expo Go compatibility
// This version generates the data but shows a message instead of creating files
class MockExportService {
  
  // Generate CSV content from expense data
  private generateExpenseCSV = async (timePeriod: TimePeriod, customRange?: CustomDateRange): Promise<string> => {
    try {
      const expenses = await getExpenses();
      
      // Filter expenses by time period
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;
      
      if (timePeriod === 'custom' && customRange) {
        // Use custom date range
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Include full end day
      } else {
        // Use predefined time periods
        switch (timePeriod) {
          case 'week':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case 'month':
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
          case 'quarter':
            startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
            break;
          case 'year':
            startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
            break;
          case 'all':
          default:
            startDate = new Date(0);
            break;
        }
      }
      
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
      
      // Sort by date (newest first)
      filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Create CSV headers
      const headers = [
        'Date',
        'Description', 
        'Amount',
        'Category',
        'Vendor',
        'Has Receipt',
        'Created At'
      ];
      
      // Create CSV rows
      const csvRows = [headers.join(',')];
      
      filteredExpenses.forEach(expense => {
        const row = [
          this.formatDateForCSV(expense.date),
          this.escapeCSVField(expense.description),
          expense.amount.toFixed(2),
          this.escapeCSVField(expense.category || 'Other'),
          this.escapeCSVField(expense.vendor || 'Unknown'),
          expense.receiptId ? 'Yes' : 'No',
          this.formatDateForCSV(expense.createdAt)
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    } catch (error) {
      console.error('Error generating expense CSV:', error);
      throw new Error('Failed to generate expense data');
    }
  };
  
  // Generate analytics CSV content
  private generateAnalyticsCSV = async (timePeriod: TimePeriod, customRange?: CustomDateRange): Promise<string> => {
    try {
      const analytics = await getReportsAnalytics(timePeriod, customRange);
      
      let csvContent = '';
      
      // Summary section
      csvContent += 'EXPENSE ANALYTICS SUMMARY\n';
      csvContent += `Time Period,${this.formatTimePeriod(timePeriod)}\n`;
      if (timePeriod === 'custom' && customRange) {
        csvContent += `Date Range,${customRange.startDate} to ${customRange.endDate}\n`;
      }
      csvContent += `Total Spent,$${analytics.summary.totalSpent.toFixed(2)}\n`;
      csvContent += `Transaction Count,${analytics.summary.transactionCount}\n`;
      csvContent += `Average Transaction,$${analytics.summary.averageTransaction.toFixed(2)}\n`;
      csvContent += `Top Category,${analytics.summary.topCategory}\n`;
      csvContent += `Top Vendor,${analytics.summary.topVendor}\n`;
      csvContent += '\n';
      
      // Categories section
      if (analytics.categories.length > 0) {
        csvContent += 'CATEGORY BREAKDOWN\n';
        csvContent += 'Category,Total Spent,Transaction Count,Average Amount,Percentage,Trend\n';
        analytics.categories.forEach(category => {
          csvContent += `${category.name},`;
          csvContent += `$${category.totalSpent.toFixed(2)},`;
          csvContent += `${category.transactionCount},`;
          csvContent += `$${category.averageAmount.toFixed(2)},`;
          csvContent += `${category.percentage.toFixed(1)}%,`;
          csvContent += `${category.trend}\n`;
        });
        csvContent += '\n';
      }
      
      // Vendors section
      if (analytics.vendors.length > 0) {
        csvContent += 'TOP VENDORS\n';
        csvContent += 'Vendor,Total Spent,Transaction Count,Average Amount,Last Transaction,Categories\n';
        analytics.vendors.forEach(vendor => {
          csvContent += `${vendor.name},`;
          csvContent += `$${vendor.totalSpent.toFixed(2)},`;
          csvContent += `${vendor.transactionCount},`;
          csvContent += `$${vendor.averageAmount.toFixed(2)},`;
          csvContent += `${this.formatDateForCSV(vendor.lastTransaction)},`;
          csvContent += `"${vendor.categories.join(', ')}"\n`;
        });
        csvContent += '\n';
      }
      
      // Trends section
      if (analytics.trends.length > 0) {
        csvContent += 'SPENDING TRENDS\n';
        csvContent += 'Date,Amount,Transaction Count\n';
        analytics.trends.forEach(trend => {
          csvContent += `${this.formatDateForCSV(trend.date)},`;
          csvContent += `$${trend.amount.toFixed(2)},`;
          csvContent += `${trend.count}\n`;
        });
      }
      
      return csvContent;
    } catch (error) {
      console.error('Error generating analytics CSV:', error);
      throw new Error('Failed to generate analytics data');
    }
  };
  
  // Generate JSON export
  private generateJSON = async (timePeriod: TimePeriod, includeAnalytics: boolean, customRange?: CustomDateRange): Promise<string> => {
    try {
      const expenses = await getExpenses();
      
      // Filter expenses by time period (same logic as CSV)
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;
      
      if (timePeriod === 'custom' && customRange) {
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        switch (timePeriod) {
          case 'week':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case 'month':
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
          case 'quarter':
            startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
            break;
          case 'year':
            startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
            break;
          case 'all':
          default:
            startDate = new Date(0);
            break;
        }
      }
      
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
      
      const exportData: any = {
        exportInfo: {
          generatedAt: new Date().toISOString(),
          timePeriod: this.formatTimePeriod(timePeriod),
          totalExpenses: filteredExpenses.length
        },
        expenses: filteredExpenses
      };
      
      // Add custom range info if applicable
      if (timePeriod === 'custom' && customRange) {
        exportData.exportInfo.customDateRange = customRange;
      }
      
      // Include analytics if requested
      if (includeAnalytics) {
        const analytics = await getReportsAnalytics(timePeriod, customRange);
        exportData.analytics = analytics;
      }
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error generating JSON export:', error);
      throw new Error('Failed to generate JSON data');
    }
  };
  
  // Mock export function - shows data in console and alert
  public exportExpenseData = async (options: ExportOptions): Promise<ExportResult> => {
    try {
      console.log('🔄 Mock export with options:', options);
      
      let content: string;
      let fileName: string;
      
      // Generate content based on format
      if (options.format === 'json') {
        content = await this.generateJSON(options.timePeriod, options.includeAnalytics, options.customRange);
        fileName = `expenses_${this.formatTimePeriod(options.timePeriod)}_${this.getDateString()}.json`;
      } else {
        // CSV format
        if (options.includeAnalytics) {
          content = await this.generateAnalyticsCSV(options.timePeriod, options.customRange);
          fileName = `expense_report_${this.formatTimePeriod(options.timePeriod)}_${this.getDateString()}.csv`;
        } else {
          content = await this.generateExpenseCSV(options.timePeriod, options.customRange);
          fileName = `expenses_${this.formatTimePeriod(options.timePeriod)}_${this.getDateString()}.csv`;
        }
      }
      
      // Log the content to console for debugging
      console.log('📄 Generated export content:');
      console.log(content.substring(0, 500) + '...');
      
      return {
        success: true,
        fileName,
        filePath: 'mock://export/' + fileName
      };
      
    } catch (error: any) {
      console.error('❌ Mock export failed:', error);
      return {
        success: false,
        error: error.message || 'Export failed'
      };
    }
  };
  
  // Quick export functions for common use cases
  public exportExpensesCSV = async (timePeriod: TimePeriod = 'all'): Promise<ExportResult> => {
    return this.exportExpenseData({
      timePeriod,
      includeAnalytics: false,
      includeCharts: false,
      format: 'csv'
    });
  };
  
  public exportFullReport = async (timePeriod: TimePeriod = 'month'): Promise<ExportResult> => {
    return this.exportExpenseData({
      timePeriod,
      includeAnalytics: true,
      includeCharts: false,
      format: 'csv'
    });
  };
  
  public exportJSON = async (timePeriod: TimePeriod = 'all'): Promise<ExportResult> => {
    return this.exportExpenseData({
      timePeriod,
      includeAnalytics: true,
      includeCharts: false,
      format: 'json'
    });
  };
  
  // Helper functions
  private escapeCSVField = (field: string): string => {
    if (!field) return '';
    
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  };
  
  private formatDateForCSV = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  private formatTimePeriod = (period: TimePeriod): string => {
    switch (period) {
      case 'week': return 'Last_7_Days';
      case 'month': return 'Last_30_Days';
      case 'quarter': return 'Last_3_Months';
      case 'year': return 'Last_Year';
      case 'all': return 'All_Time';
      case 'custom': return 'Custom_Range';
      default: return 'Unknown';
    }
  };
  
  private getDateString = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
  };
}

// Export singleton instance
export const exportService = new MockExportService();

// Export types and service
export default exportService; 