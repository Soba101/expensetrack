# Export Functionality Documentation

## Overview
The ExpenseTrack app now includes comprehensive data export functionality, allowing users to export their expense data in multiple formats for analysis, backup, or sharing purposes.

## Features

### Export Formats
- **CSV (Spreadsheet)**: Perfect for Excel, Google Sheets, and data analysis
- **JSON (Data)**: Ideal for developers and data backup

### Export Options
- **Time Periods**: Last 7 days, 30 days, 3 months, year, or all time
- **Data Types**: Raw expense data or comprehensive analytics reports
- **Analytics Include**: Category breakdowns, spending trends, vendor analysis

### Export Types

#### 1. Basic Expense Export
- Raw expense data in CSV or JSON format
- Includes: Date, Description, Amount, Category, Vendor, Receipt status
- Perfect for importing into other financial tools

#### 2. Analytics Report Export
- Comprehensive analytics in CSV format
- Includes: Summary metrics, category breakdowns, vendor analysis, spending trends
- Perfect for detailed financial analysis

#### 3. JSON Data Export
- Complete data export including analytics
- Machine-readable format for developers
- Includes metadata and export information

## How to Use

### From Reports Screen
1. Navigate to the Reports & Analytics screen
2. Tap the download icon in the top-right corner
3. Select your preferred time period
4. Choose export format (CSV or JSON)
5. Select whether to include analytics
6. Tap "Export Data"
7. Share or save the generated file

### Export File Names
Files are automatically named with descriptive patterns:
- Basic CSV: `expenses_Last_30_Days_20241201.csv`
- Analytics Report: `expense_report_Last_30_Days_20241201.csv`
- JSON Export: `expenses_All_Time_20241201.json`

## CSV Export Structure

### Basic Expense CSV
```csv
Date,Description,Amount,Category,Vendor,Has Receipt,Created At
12/01/2024,Coffee Shop,5.50,Food & Dining,Starbucks,No,12/01/2024
11/30/2024,Gas Station,45.00,Transportation,Shell,Yes,11/30/2024
```

### Analytics Report CSV
```csv
EXPENSE SUMMARY
Metric,Value
Total Spent,$1,234.56
Transaction Count,45
Average Transaction,$27.43

CATEGORY BREAKDOWN
Category,Amount,Transactions,Average,Percentage,Trend
Food & Dining,$456.78,23,$19.86,37.0%,up
Transportation,$234.56,12,$19.55,19.0%,down
```

## JSON Export Structure
```json
{
  "exportInfo": {
    "generatedAt": "2024-12-01T10:30:00.000Z",
    "timePeriod": "Last_30_Days",
    "totalExpenses": 45
  },
  "expenses": [...],
  "analytics": {...}
}
```

## Technical Implementation

### Services Used
- **ExportService**: Main export logic and file generation
- **expo-file-system**: File creation and storage
- **expo-sharing**: Native sharing functionality

### File Storage
- Files are temporarily stored in the app's document directory
- Automatically shared via the native sharing interface
- Files can be saved to device storage or shared with other apps

## Supported Platforms
- ✅ iOS: Full functionality with native sharing
- ✅ Android: Full functionality with native sharing
- ⚠️ Web: Limited sharing capabilities (download only)

## Error Handling
- Graceful error handling with user-friendly messages
- Automatic retry suggestions for failed exports
- Detailed logging for debugging

## Future Enhancements
- 📊 Chart image exports (coming soon)
- 📧 Email integration for direct sharing
- ☁️ Cloud storage integration (Google Drive, iCloud)
- 📅 Scheduled exports
- 🔄 Automated backup functionality

## Troubleshooting

### Common Issues
1. **Export fails**: Check device storage space
2. **Sharing not available**: Ensure app permissions are granted
3. **Empty export**: Verify data exists for selected time period

### Support
For technical issues or feature requests, please check the app logs or contact support.

---

*Last updated: December 2024* 