import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

async function checkTables() {
  console.log('🔍 Supabase 데이터 확인...\n');

  // 1. knowledge 데이터 개수 (Level 2 RAG용)
  const { count: docsCount, error: docsErr } = await supabase
    .from('knowledge')
    .select('*', { count: 'exact', head: true });
  console.log('📄 knowledge:', docsErr ? '❌ ' + docsErr.message : docsCount + '개');

  // 2. conversations 데이터 개수 (Level 3 Memory용)
  const { count: convsCount, error: convsErr } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });
  console.log('💬 conversations:', convsErr ? '❌ ' + convsErr.message : convsCount + '개');

  // 3. user_summaries 데이터 개수 (Level 3 Memory용)
  const { count: sumsCount, error: sumsErr } = await supabase
    .from('user_summaries')
    .select('*', { count: 'exact', head: true });
  console.log('📝 user_summaries:', sumsErr ? '❌ ' + sumsErr.message : sumsCount + '개');
}

checkTables();
