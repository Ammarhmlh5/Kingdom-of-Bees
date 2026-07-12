/**
 * سكربت اختبار اتصال Supabase من تطبيق الهاتف
 * يمكن تشغيله باستخدام: node tools/test-supabase-connection.js
 */

// محاكاة متغيرات البيئة في Expo
// في التطبيق الفعلي، سيتم تحميلها تلقائياً من .env
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

// استخدام نفس المتغيرات البيئية من platform
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_URL_PLATFORM;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_KEY_PLATFORM;

console.log('🔍 Testing Supabase connection for mobile app...\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   Required: SUPABASE_URL and SUPABASE_KEY');
  console.error('   Or: SUPABASE_URL_PLATFORM and SUPABASE_KEY_PLATFORM');
  console.error('\n💡 Make sure you have a .env file in packages/db/ with these variables');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('   URL:', SUPABASE_URL);
console.log('   Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    console.log('🔄 Testing connection to sync_event table...');
    const { data, error, status } = await supabase
      .from('sync_event')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed!');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      process.exit(1);
    }
    
    console.log('✅ Connection successful!');
    console.log('   Status:', status);
    console.log('   Records found:', data ? data.length : 0);
    console.log('\n🎉 Supabase is ready for mobile app!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create .env file in mobile/ directory with:');
    console.log('      EXPO_PUBLIC_SUPABASE_URL=' + SUPABASE_URL);
    console.log('      EXPO_PUBLIC_SUPABASE_ANON_KEY=' + SUPABASE_KEY);
    console.log('   2. Import supabase client in your app:');
    console.log('      import { supabase } from "@/lib/supabaseClient";');
    
  } catch (e) {
    console.error('❌ Test failed with exception:', e.message);
    process.exit(1);
  }
})();

