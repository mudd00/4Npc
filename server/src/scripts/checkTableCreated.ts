import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTableCreatedTime() {
  // PostgreSQL 시스템 카탈로그에서 테이블 생성 시간 조회
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        relname as table_name,
        pg_catalog.obj_description(oid, 'pg_class') as description
      FROM pg_class
      WHERE relname IN ('knowledge', 'npc_documents', 'conversations', 'user_summaries')
      AND relkind = 'r'
    `
  });

  if (error) {
    console.log('시스템 카탈로그 직접 조회 불가:', error.message);
    console.log('\n→ Supabase 대시보드에서 확인하세요:');
    console.log('  Table Editor → 각 테이블 선택 → 우측 상단 ... → View table info');
    return;
  }

  console.log(data);
}

checkTableCreatedTime();
