// 'use client' 컴포넌트에서 따라 들어가는 파일에 채점 코드나 DB 코드가 섞이지 않는지 확인한다(스펙 §6.1, §6.4).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..', '..');
const SERVER_ONLY = ['lib/db/', 'lib/scoring/v1/'];

const walk = (dir: string): string[] =>
  !existsSync(dir) ? [] : readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []);

// `import type …`은 빌드에서 지워지므로 따라가지 않는다.
function valueImports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const found: string[] = [];
  for (const m of source.matchAll(/^import\s+(?!type\s)[^'"]*?['"]([^'"]+)['"]/gm)) {
    const spec = m[1];
    if (spec.startsWith('@/')) found.push(join(ROOT, spec.slice(2)));
    else if (spec.startsWith('.')) found.push(resolve(dirname(file), spec));
  }
  return found.filter(f => existsSync(f));
}

function reachable(entry: string): string[] {
  const seen = new Set<string>([entry]);
  const queue = [entry];
  while (queue.length > 0) {
    for (const next of valueImports(queue.pop()!)) {
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return [...seen].map(f => relative(ROOT, f).replaceAll('\\', '/'));
}

describe('브라우저 번들 경계', () => {
  const entries = [...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'components'))]
    .filter(f => /^\s*['"]use client['"]/.test(readFileSync(f, 'utf8')));

  it('클라이언트 컴포넌트가 하나 이상 있다', () => {
    assert.ok(entries.length > 0);
  });

  for (const entry of entries) {
    const name = relative(ROOT, entry).replaceAll('\\', '/');
    it(`${name}: 채점·DB 코드를 가져오지 않는다`, () => {
      const leaked = reachable(entry).filter(f => SERVER_ONLY.some(dir => f.startsWith(dir)));
      assert.deepEqual(leaked, []);
    });
  }
});
