/**
 * Test script for Kolosal AI API
 * Run with: npx tsx scripts/test-kolosal-ai.ts
 */

import 'dotenv/config';

const KOLOSAL_API_URL = 'https://api.kolosal.ai/v1/chat/completions';
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY;

async function testKolosalAI() {
  console.log('=== Kolosal AI API Test ===\n');

  // Check API key
  if (!KOLOSAL_API_KEY) {
    console.error('❌ KOLOSAL_API_KEY not found in environment variables');
    console.log('   Add it to your .env file');
    process.exit(1);
  }

  const maskedKey =
    KOLOSAL_API_KEY.substring(0, 15) +
    '...' +
    KOLOSAL_API_KEY.substring(KOLOSAL_API_KEY.length - 10);
  console.log(`✓ API Key found: ${maskedKey}\n`);

  // Test API connection
  console.log('Testing API connection...\n');

  try {
    const response = await fetch(KOLOSAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KOLOSAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'Claude Sonnet 4.5',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from Kolosal AI!" in one sentence.',
          },
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();

    console.log('✓ API Connection Successful!\n');
    console.log('Response:');
    console.log(`  Model: ${data.model}`);
    console.log(`  Message: ${data.choices[0]?.message?.content}`);

    if (data.usage) {
      console.log(`\nUsage:`);
      console.log(`  Prompt tokens: ${data.usage.prompt_tokens}`);
      console.log(`  Completion tokens: ${data.usage.completion_tokens}`);
      console.log(`  Total tokens: ${data.usage.total_tokens}`);
    }

    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error(
      '❌ Request failed:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

testKolosalAI();
