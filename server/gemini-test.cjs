// Test directo de Gemini API
const genai = require('@google/genai');
require('dotenv').config();

console.log('🧪 Testing Gemini API...');
console.log('API Key configured:', process.env.GEMINI_API_KEY ? '✅ Yes' : '❌ No');
console.log('Package imported:', genai ? '✅ Yes' : '❌ No');

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  const GoogleGenerativeAI = genai.GoogleGenerativeAI;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async function testGemini() {
    try {
      console.log('📤 Sending test request to Gemini...');
      const result = await model.generateContent("Say hello in Spanish");
      console.log('✅ Gemini Response:', result.response.text());
    } catch (error) {
      console.log('❌ Gemini Error:', error.message);
    }
  }

  testGemini();
} else {
  console.log('❌ No valid API key found');
}