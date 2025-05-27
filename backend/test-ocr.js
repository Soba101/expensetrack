// Test script for OCR service
// Run with: node test-ocr.js

require('dotenv').config();
const ocrService = require('./services/ocrService');

async function testOCR() {
  console.log('🧪 Testing OCR Service...');
  console.log('📋 Environment check:');
  console.log('- Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
  console.log('- Credentials file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  
  try {
    // Test the service initialization
    const testResult = await ocrService.testOCR();
    console.log('✅ Test result:', testResult);
    
    console.log('\n🎉 OCR service is ready for receipt processing!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Test OCR endpoint: GET /api/receipts/test/ocr');
    console.log('3. Upload a receipt and process it: POST /api/receipts/:id/process');
    
  } catch (error) {
    console.error('❌ OCR test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has the correct Google Cloud settings');
    console.log('2. Verify google-vision-key.json is in the backend directory');
    console.log('3. Ensure Google Cloud Vision API is enabled in your project');
  }
}

testOCR(); 