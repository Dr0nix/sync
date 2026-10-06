// 서버 전용. Route Handler와 scripts/에서만 import한다. 클라이언트 컴포넌트에서 import 금지(스펙 §6.4).
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL 환경변수가 없습니다.');
  return url;
}

// 스키마 이름은 SQL에 식별자로 그대로 들어가므로 형식을 제한한다.
export function dbSchema(): string {
  const schema = process.env.DB_SCHEMA;
  if (!schema) throw new Error('DB_SCHEMA 환경변수가 없습니다.');
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    throw new Error(`DB_SCHEMA 형식이 올바르지 않습니다: ${schema}`);
  }
  return schema;
}

let cached: NeonQueryFunction<false, false> | undefined;

// 빌드 시점에 환경변수가 없어도 import만으로 실패하지 않도록 처음 쓸 때 만든다.
export function getSql(): NeonQueryFunction<false, false> {
  cached ??= neon(databaseUrl());
  return cached;
}

// 테이블 이름 앞에 스키마를 붙인다. 풀러 연결이라 search_path를 세션에 고정할 수 없다.
// 예: sql`SELECT * FROM ${table('profiles')} WHERE id = ${id}`
export function table(name: string) {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error(`테이블 이름 형식이 올바르지 않습니다: ${name}`);
  return getSql().unsafe(`"${dbSchema()}"."${name}"`);
}
