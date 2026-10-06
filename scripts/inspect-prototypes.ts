// Sprint 0 — Prototype 간 가중 거리 행렬 출력
// 실행: node scripts/inspect-prototypes.ts
import { PROTOTYPES, TYPE_IDS } from '../lib/scoring/v1/prototypes.ts';
import { weightedDistance } from '../lib/scoring/v1/resolve-type.ts';

const TOO_CLOSE = 10;

// 가중치가 타입마다 달라 거리가 비대칭이다. 행 = 좌표, 열 = 그 타입의 가중치로 잰 거리.
const d = (from: (typeof TYPE_IDS)[number], to: (typeof TYPE_IDS)[number]) =>
  weightedDistance(PROTOTYPES[from].vector, PROTOTYPES[to]);

const short = (id: string) => id.slice(0, 7).padStart(8);

console.log('가중 거리 행렬 (행의 좌표 → 열의 Prototype)\n');
console.log(' '.repeat(22) + TYPE_IDS.map(short).join(''));
for (const a of TYPE_IDS) {
  const row = TYPE_IDS.map(b => (a === b ? '-' : d(a, b).toFixed(1)).padStart(8)).join('');
  console.log(a.padEnd(22) + row);
}

// 타입 판정에서 경쟁하는 건 balance_player를 뺀 11개다.
const pairs: { a: string; b: string; min: number }[] = [];
for (let i = 0; i < TYPE_IDS.length; i++) {
  for (let j = i + 1; j < TYPE_IDS.length; j++) {
    const a = TYPE_IDS[i], b = TYPE_IDS[j];
    if (a === 'balance_player' || b === 'balance_player') continue;
    pairs.push({ a, b, min: Math.min(d(a, b), d(b, a)) });
  }
}
pairs.sort((x, y) => x.min - y.min);

console.log('\n가장 가까운 쌍 5개 (양방향 중 작은 값)');
for (const p of pairs.slice(0, 5)) {
  const flag = p.min < TOO_CLOSE ? '  ← 거리 10 미만: 사실상 같은 타입' : '';
  console.log(`  ${p.min.toFixed(1).padStart(5)}  ${p.a} ↔ ${p.b}${flag}`);
}

const tooClose = pairs.filter(p => p.min < TOO_CLOSE).length;
console.log(`\n거리 ${TOO_CLOSE} 미만 쌍: ${tooClose}개`);
