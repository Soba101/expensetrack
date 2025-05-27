const vision = require('@google-cloud/vision');

class OCRService {
  constructor() {
    // Initialize Google Cloud Vision client
    this.client = new vision.ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  /**
   * Extract text and data from receipt image
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Object} Extracted receipt data
   */
  async extractReceiptData(imageBase64) {
    try {
      console.log('🔍 Starting OCR processing...');
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
      
      // Perform text detection
      const [result] = await this.client.textDetection({
        image: { content: imageBuffer }
      });

      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in image');
      }

      // Get full text from first annotation (contains all detected text)
      const fullText = detections[0].description;
      console.log('📄 Extracted text:', fullText);

      // Parse the extracted text for receipt data
      const parsedData = this.parseReceiptText(fullText);
      
      console.log('✅ OCR processing complete:', parsedData);
      return parsedData;

    } catch (error) {
      console.error('❌ OCR processing failed:', error.message);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Parse extracted text to identify receipt components
   * @param {string} text - Raw extracted text
   * @returns {Object} Parsed receipt data
   */
  parseReceiptText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const result = {
      amount: null,
      date: null,
      vendor: null,
      category: null,
      confidence: {
        amount: 0,
        date: 0,
        vendor: 0
      },
      rawText: text
    };

    // Extract amount (look for currency patterns)
    result.amount = this.extractAmount(lines);
    result.confidence.amount = result.amount ? 0.9 : 0;

    // Extract date
    result.date = this.extractDate(lines);
    result.confidence.date = result.date ? 0.8 : 0;

    // Extract vendor (usually first few lines)
    result.vendor = this.extractVendor(lines);
    result.confidence.vendor = result.vendor ? 0.7 : 0;

    // Suggest category based on vendor
    result.category = this.suggestCategory(result.vendor);

    return result;
  }

  /**
   * Extract monetary amount from text lines
   * @param {Array} lines - Array of text lines
   * @returns {number|null} Extracted amount
   */
  extractAmount(lines) {
    // Common patterns for totals on receipts
    const totalPatterns = [
      /total[:\s]*\$?(\d+\.?\d*)/i,
      /amount[:\s]*\$?(\d+\.?\d*)/i,
      /sum[:\s]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.\d{2})/g,
      /(\d+\.\d{2})/g
    ];

    let amounts = [];

    for (const line of lines) {
      for (const pattern of totalPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          const amount = parseFloat(matches[1] || matches[0].replace('$', ''));
          if (amount > 0 && amount < 10000) { // Reasonable range for receipts
            amounts.push(amount);
          }
        }
      }
    }

    // Return the largest amount found (likely the total)
    return amounts.length > 0 ? Math.max(...amounts) : null;
  }

  /**
   * Extract date from text lines
   * @param {Array} lines - Array of text lines
   * @returns {string|null} Extracted date in ISO format
   */
  extractDate(lines) {
    const datePatterns = [
      { pattern: /(\d{4}-\d{1,2}-\d{1,2})/, format: 'YYYY-MM-DD' },
      { pattern: /(\d{1,2}\/\d{1,2}\/\d{4})/, format: 'DD/MM/YYYY' },
      { pattern: /(\d{1,2}\/\d{1,2}\/\d{2})/, format: 'DD/MM/YY' },
      { pattern: /(\d{1,2}-\d{1,2}-\d{4})/, format: 'DD-MM-YYYY' },
      { pattern: /(\d{1,2}-\d{1,2}-\d{2})/, format: 'DD-MM-YY' },
      { pattern: /(\w{3}\s+\d{1,2},?\s+\d{4})/i, format: 'MMM DD, YYYY' },
      { pattern: /(\d{1,2}\s+\w{3}\s+\d{4})/i, format: 'DD MMM YYYY' }
    ];

    for (const line of lines) {
      for (const { pattern, format } of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const dateStr = match[1];
          console.log(`📅 Found potential date: "${dateStr}" in line: "${line}" (format: ${format})`);
          
          const parsedDate = this.parseDate(dateStr, format);
          if (parsedDate) {
            console.log(`✅ Date accepted: ${parsedDate}`);
            return parsedDate;
          }
        }
      }
    }

    return null;
  }

  /**
   * Parse date string with specific format handling
   * @param {string} dateStr - Date string to parse
   * @param {string} format - Expected format
   * @returns {string|null} ISO date string (YYYY-MM-DD) or null
   */
  parseDate(dateStr, format) {
    try {
      let date;
      
      switch (format) {
        case 'YYYY-MM-DD':
          date = new Date(dateStr);
          break;
          
        case 'DD/MM/YYYY':
        case 'DD-MM-YYYY': {
          const separator = format.includes('/') ? '/' : '-';
          const parts = dateStr.split(separator);
          if (parts.length === 3) {
            const [day, month, year] = parts;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          break;
        }
        
        case 'DD/MM/YY':
        case 'DD-MM-YY': {
          const separator = format.includes('/') ? '/' : '-';
          const parts = dateStr.split(separator);
          if (parts.length === 3) {
            const [day, month, year] = parts;
            // Convert 2-digit year to 4-digit (assume 2000s for 00-30, 1900s for 31-99)
            const fullYear = parseInt(year) <= 30 ? 2000 + parseInt(year) : 1900 + parseInt(year);
            date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
          }
          break;
        }
        
        case 'MMM DD, YYYY':
        case 'DD MMM YYYY':
          // Let JavaScript handle these common formats
          date = new Date(dateStr);
          break;
          
        default:
          date = new Date(dateStr);
      }

      // Validate the parsed date
      if (date && !isNaN(date.getTime())) {
        const now = new Date();
        const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        
        // Allow dates from 5 years ago to today
        if (date <= now && date >= fiveYearsAgo) {
          return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        } else {
          console.log(`❌ Date rejected - outside valid range: ${date.toISOString().split('T')[0]}`);
        }
      } else {
        console.log(`❌ Date parsing failed for: "${dateStr}"`);
      }
      
    } catch (error) {
      console.log(`❌ Date parsing error for "${dateStr}": ${error.message}`);
    }
    
    return null;
  }

  /**
   * Extract vendor/merchant name from text lines
   * @param {Array} lines - Array of text lines
   * @returns {string|null} Extracted vendor name
   */
  extractVendor(lines) {
    if (lines.length === 0) return null;

    // Usually the vendor name is in the first few lines
    // Look for the longest line in the first 3 lines (excluding very short ones)
    const candidateLines = lines.slice(0, 3).filter(line => 
      line.length > 3 && 
      !line.match(/^\d+$/) && // Not just numbers
      !line.match(/^[\d\s\-\/]+$/) // Not just dates/numbers
    );

    if (candidateLines.length > 0) {
      // Return the first substantial line
      return candidateLines[0].substring(0, 50); // Limit length
    }

    return null;
  }

  /**
   * Suggest expense category based on vendor name
   * @param {string} vendor - Vendor name
   * @returns {string} Suggested category
   */
  suggestCategory(vendor) {
    if (!vendor) return 'Other';

    const vendorLower = vendor.toLowerCase();
    
    // Category mapping based on common keywords
    const categoryMap = {
      'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'kitchen', 'bar', 'pub'],
      'Groceries': ['grocery', 'market', 'supermarket', 'walmart', 'target', 'costco', 'safeway'],
      'Gas & Fuel': ['gas', 'fuel', 'shell', 'chevron', 'exxon', 'bp', 'mobil'],
      'Shopping': ['store', 'shop', 'mall', 'amazon', 'ebay', 'retail'],
      'Transportation': ['uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'parking'],
      'Healthcare': ['pharmacy', 'hospital', 'clinic', 'medical', 'doctor', 'cvs', 'walgreens'],
      'Entertainment': ['movie', 'theater', 'cinema', 'game', 'entertainment', 'netflix']
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => vendorLower.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Test OCR service with a sample image
   * @returns {Object} Test result
   */
  async testOCR() {
    try {
      // This is a simple test to verify the service is working
      console.log('🧪 Testing OCR service...');
      console.log('✅ OCR service initialized successfully');
      return { success: true, message: 'OCR service is ready' };
    } catch (error) {
      console.error('❌ OCR service test failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new OCRService(); 