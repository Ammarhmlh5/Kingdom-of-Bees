const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL || process.env.SUPABASE_URL_PLATFORM;
const key = process.env.SUPABASE_KEY || process.env.SUPABASE_KEY_PLATFORM;
if (!url || !key) { console.error('Missing SUPABASE_URL or SUPABASE_KEY in env (or SUPABASE_..._PLATFORM)'); process.exit(2); }
const supabase = createClient(url, key);
(async () => {
  try {
    console.log('Using SUPABASE_URL=', url);
    const { data, error, status } = await supabase.from('sync_event').select('*').limit(1);
    console.log('select status=', status);
    if (error) console.log('error:', error);
    else console.log('data:', data);
  } catch (e) {
    console.error('check failed', e);
    process.exit(3);
  }
})();
