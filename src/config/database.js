import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
    neonConfig.fetchEndpoint = 'http://neon_local:5432/sql';
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
}

// Configure Neon serverless driver based on environment
function configureNeonDriver() {
  // Check if we're using Neon Local (development)
  const isNeonLocal = process.env.DATABASE_URL && 
    (process.env.DATABASE_URL.includes('neon-local') || 
     process.env.DATABASE_URL.includes('localhost'));
  
  if (isNeonLocal) {
    console.log('🔧 Configuring Neon serverless driver for Neon Local...');
    
    // Extract host from DATABASE_URL for Neon Local
    const url = new URL(process.env.DATABASE_URL);
    const host = url.hostname;
    const port = url.port || '5432';
    
    // Configure for Neon Local HTTP endpoint
    neonConfig.fetchEndpoint = `http://${host}:${port}/sql`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
    
    // For standard postgres driver compatibility with self-signed certs
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  } else {
    console.log('☁️ Configuring Neon serverless driver for Neon Cloud...');
    // Use default Neon Cloud configuration
    // neonConfig will use defaults for cloud connections
  }
}

// Initialize configuration
configureNeonDriver();

// Create the connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Test the connection
async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Test connection on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

// const sql = neon(process.env.DATABASE_URL);

// const db = drizzle(sql);

export { db, sql };
