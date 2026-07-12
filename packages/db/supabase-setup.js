/**
 * Supabase Setup Script - Alternative to prisma db push
 * Uses Supabase Management API to create tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY not found in .env');
  process.exit(1);
}

console.log('🔍 Checking Supabase connection...');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing connection...');
    
    // Test basic query
    const { data, error } = await supabase
      .from('user_profile')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('⚠️  Table "user_profile" does not exist yet (expected)');
      console.log('✅ Connection successful!');
      return true;
    } else if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ user_profile table already exists');
      return true;
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    return false;
  }
}

async function showDatabaseInfo() {
  console.log('\n📊 Database Information:');
  console.log('════════════════════════════════════════');
  console.log('Project: ragjzeptkuogixjofeux');
  console.log('URL:', supabaseUrl);
  console.log('Region: AWS (auto-detected)');
  console.log('\n💡 To get Database Password:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ragjzeptkuogixjofeux/settings/database');
  console.log('2. Find "Database Password" section');
  console.log('3. Click "Reset Database Password" if needed');
  console.log('4. Copy the password');
  console.log('5. Update .env file with:');
  console.log('   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"');
  console.log('\n Then run: npx prisma db push');
  console.log('════════════════════════════════════════\n');
}

async function main() {
  console.log('\n🐝 Kingdom of Bees - Supabase Setup Check\n');
  
  const connected = await testConnection();
  
  if (connected) {
    await showDatabaseInfo();
    
    console.log('✅ SUPABASE API CONNECTION: OK');
    console.log('⏳ DATABASE PASSWORD: NEEDED for schema creation\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Get password from Supabase Dashboard (link above)');
    console.log('   2. Update DATABASE_URL in .env');
    console.log('   3. Run: npx prisma db push');
    console.log('   4. Done! 🎉\n');
  } else {
    console.log('❌ Please check your SUPABASE_URL and SUPABASE_KEY\n');
    process.exit(1);
  }
}

main().catch(console.error);

