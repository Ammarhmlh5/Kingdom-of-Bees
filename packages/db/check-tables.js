/**
 * Check existing tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const tables = [
  'user_profile',
  'apiary',
  'hive',
  'inspection',
  'queen',
  'feeding_record',
  'disease_library',
  'harvest_record',
  'weather_data',
  'plant_library'
];

async function checkTables() {
  console.log('\n🔍 Checking tables in Supabase...\n');
  
  let existingCount = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`❌ ${table} - NOT EXISTS`);
      } else if (error) {
        console.log(`⚠️  ${table} - ERROR: ${error.message}`);
      } else {
        console.log(`✅ ${table} - EXISTS`);
        existingCount++;
      }
    } catch (err) {
      console.log(`❌ ${table} - ERROR: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Summary: ${existingCount}/${tables.length} tables exist\n`);
  
  if (existingCount === tables.length) {
    console.log('🎉 ALL CORE TABLES EXIST!');
    console.log('✅ Your database is ready to use!');
    console.log('\n🚀 Next: Start the server');
    console.log('   cd packages/platform');
    console.log('   npm run dev\n');
  } else if (existingCount > 0) {
    console.log('⚠️  Some tables exist, some don\'t');
    console.log('💡 You may need to run: npx prisma db push\n');
  } else {
    console.log('❌ No tables found');
    console.log('💡 Run: npx prisma db push (requires password)\n');
  }
}

checkTables().catch(console.error);

