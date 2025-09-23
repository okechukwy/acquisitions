/**
 * Simple test script to verify rate limiting functionality
 * Run this after starting the server to test rate limits
 */

import fetch from 'node:fetch';

const BASE_URL = 'http://localhost:3000';

async function testRateLimit(endpoint, maxRequests = 10, delayMs = 100) {
  console.log(`\n🧪 Testing rate limiting for ${endpoint}`);
  console.log(
    `Making ${maxRequests} requests with ${delayMs}ms delay between requests...\n`
  );

  const results = [];

  for (let i = 1; i <= maxRequests; i++) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test${i}@example.com`,
          password: 'testpassword123',
          name: `Test User ${i}`,
        }),
      });

      const responseTime = Date.now() - startTime;
      const status = response.status;

      results.push({
        request: i,
        status,
        responseTime,
        blocked: status === 429,
      });

      if (status === 429) {
        console.log(`❌ Request ${i}: BLOCKED (429) - ${responseTime}ms`);
      } else if (status >= 400) {
        console.log(`⚠️  Request ${i}: ERROR (${status}) - ${responseTime}ms`);
      } else {
        console.log(`✅ Request ${i}: SUCCESS (${status}) - ${responseTime}ms`);
      }
    } catch (error) {
      console.log(`💥 Request ${i}: FAILED - ${error.message}`);
      results.push({
        request: i,
        status: 'ERROR',
        error: error.message,
        blocked: false,
      });
    }

    // Add delay between requests
    if (i < maxRequests) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Summary
  const blocked = results.filter(r => r.blocked).length;
  const successful = results.filter(
    r => r.status < 400 && r.status !== 'ERROR'
  ).length;
  const errors = results.filter(
    r => r.status >= 400 && r.status !== 429
  ).length;

  console.log(`\n📊 Summary for ${endpoint}:`);
  console.log(`   ✅ Successful: ${successful}/${maxRequests}`);
  console.log(`   ❌ Rate Limited: ${blocked}/${maxRequests}`);
  console.log(`   ⚠️  Other Errors: ${errors}/${maxRequests}`);

  return results;
}

async function testGeneralRateLimit() {
  console.log('\n🧪 Testing general rate limiting (health endpoint)');

  const maxRequests = 25; // Should be well within the 100/min limit
  const results = [];

  for (let i = 1; i <= maxRequests; i++) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/health`);
      const responseTime = Date.now() - startTime;
      const status = response.status;

      results.push({
        request: i,
        status,
        responseTime,
        blocked: status === 429,
      });

      if (status === 429) {
        console.log(`❌ Request ${i}: BLOCKED (429) - ${responseTime}ms`);
      } else {
        console.log(`✅ Request ${i}: SUCCESS (${status}) - ${responseTime}ms`);
      }
    } catch (error) {
      console.log(`💥 Request ${i}: FAILED - ${error.message}`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const blocked = results.filter(r => r.blocked).length;
  const successful = results.filter(r => r.status < 400).length;

  console.log('\n📊 General Rate Limit Summary:');
  console.log(`   ✅ Successful: ${successful}/${maxRequests}`);
  console.log(`   ❌ Rate Limited: ${blocked}/${maxRequests}`);
}

async function main() {
  console.log('🚀 Starting Rate Limiting Tests');
  console.log('Make sure the server is running on http://localhost:3000\n');

  try {
    // Test general rate limiting (should allow most requests)
    await testGeneralRateLimit();

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test auth rate limiting (should be more restrictive)
    await testRateLimit('/api/auth/sign-in', 8, 200);

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test signup rate limiting (should be most restrictive)
    await testRateLimit('/api/auth/sign-up', 6, 300);
  } catch (error) {
    console.error('Test failed:', error.message);
  }

  console.log('\n✅ Rate limiting tests completed!');
  console.log('\n💡 Expected behavior:');
  console.log(
    '   - General endpoints: 100 requests/minute (should allow most)'
  );
  console.log(
    '   - Auth endpoints: 5 requests/minute (should block after 5-10)'
  );
  console.log(
    '   - Signup endpoint: 3 requests/minute (should block after 3-5)'
  );
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
