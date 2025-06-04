// Simple test file for export service
// This helps verify the export functionality works correctly

import exportService, { ExportOptions } from '../exportService';

// Mock test data
const mockExpenses = [
  {
    id: '1',
    description: 'Coffee Shop',
    amount: 5.50,
    category: 'Food & Dining',
    vendor: 'Starbucks',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    receiptId: null
  },
  {
    id: '2',
    description: 'Gas Station',
    amount: 45.00,
    category: 'Transportation',
    vendor: 'Shell',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    receiptId: 'receipt123'
  }
];

// Test export functionality
export const testExportService = async () => {
  console.log('🧪 Testing Export Service...');
  
  try {
    // Test CSV export
    const csvOptions: ExportOptions = {
      timePeriod: 'week',
      includeAnalytics: false,
      includeCharts: false,
      format: 'csv'
    };
    
    console.log('📊 Testing CSV export...');
    const csvResult = await exportService.exportExpenseData(csvOptions);
    console.log('CSV Result:', csvResult);
    
    // Test JSON export
    const jsonOptions: ExportOptions = {
      timePeriod: 'month',
      includeAnalytics: true,
      includeCharts: false,
      format: 'json'
    };
    
    console.log('📄 Testing JSON export...');
    const jsonResult = await exportService.exportExpenseData(jsonOptions);
    console.log('JSON Result:', jsonResult);
    
    // Test analytics export
    console.log('📈 Testing analytics export...');
    const analyticsResult = await exportService.exportFullReport('month');
    console.log('Analytics Result:', analyticsResult);
    
    console.log('✅ All export tests completed!');
    
  } catch (error) {
    console.error('❌ Export test failed:', error);
  }
};

// Export test function for manual testing
export default testExportService; 