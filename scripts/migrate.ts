// db/migrations/*.sql을 파일명 순서로 DB_SCHEMA에 적용한다. 이미 적용한 파일은 건너뛴다.
// 실행: npm run db:migrate            (적용)
//       npm run db:migrate -- --dry   (적용할 파일 목록만 출력)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from '@neondatabase/serverless';
import { databaseUrl, dbSchema } from '../lib/db/client.ts';

const DIR = join(import.meta.dirname, '..', 'db', 'migrations');
const dry = process.argv.includes('--dry');

const schema = dbSchema();
const files = readdirSync(DIR).filter(f => f.endsWith('.sql')).sort();

const client = new Client(databaseUrl());
await client.connect();

try {
  // --dry는 DB에 아무것도 쓰지 않는다. 이력 테이블이 아직 없으면 전부 대기로 본다.
  const { rows: [{ exists }] } = await client.query(
    `SELECT to_regclass($1) IS NOT NULL AS exists`, [`"${schema}".schema_migrations`],
  );

  if (!dry) {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    // 적용 이력 테이블. 스펙 §5의 데이터 모델과는 별개인 관리용 테이블이다.
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${schema}".schema_migrations (
        filename   VARCHAR PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT now()
      )
    `);
  }

  const { rows } = exists || !dry
    ? await client.query(`SELECT filename FROM "${schema}".schema_migrations`)
    : { rows: [] };
  const applied = new Set(rows.map(r => r.filename as string));
  const pending = files.filter(f => !applied.has(f));

  console.log(`스키마 "${schema}": 적용됨 ${applied.size}개 / 대기 ${pending.length}개`);

  for (const file of pending) {
    if (dry) {
      console.log(`  (dry) ${file}`);
      continue;
    }
    // 파일 하나 = 트랜잭션 하나. 실패하면 그 파일 전체가 롤백된다.
    await client.query('BEGIN');
    try {
      await client.query(`SET LOCAL search_path TO "${schema}"`);
      await client.query(readFileSync(join(DIR, file), 'utf8'));
      await client.query(`INSERT INTO "${schema}".schema_migrations (filename) VALUES ($1)`, [file]);
      await client.query('COMMIT');
      console.log(`  적용 ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`${file} 적용 실패`, { cause: err });
    }
  }
} finally {
  await client.end();
}
