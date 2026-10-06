// Sprint 0 — 가상 사용자 타입 분포 시뮬레이션
// 실행: node scripts/simulate-types.ts [인원수] [seed]
import { AXES, TYPE_IDS, type Axes, type TypeId } from '../lib/scoring/v1/prototypes.ts';
import { resolveType } from '../lib/scoring/v1/resolve-type.ts';

const N = Number(process.argv[2] ?? 10_000);
const SEED = Number(process.argv[3] ?? 1);
const MEAN = 50, SD = 18;   // 스펙 §14 Sprint 0: 균등난수보다 실제 응답 분포에 가깝다
const MAX_SHARE = 30;

// 결과를 재현할 수 있도록 시드 고정 난수(mulberry32)를 쓴다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);

function normal(): number {
  const u = 1 - rand(), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randomUser(): Axes {
  const user = {} as Axes;
  for (const k of AXES) {
    user[k] = Math.min(100, Math.max(0, Math.round(MEAN + SD * normal())));
  }
  return user;
}

const counts = Object.fromEntries(TYPE_IDS.map(id => [id, 0])) as Record<TypeId, number>;
let withSubtype = 0;

for (let i = 0; i < N; i++) {
  const { typeId, subtypeId } = resolveType(randomUser());
  counts[typeId]++;
  if (subtypeId) withSubtype++;
}

console.log(`가상 사용자 ${N}명 (축별 정규분포 평균 ${MEAN} / 표준편차 ${SD}, seed ${SEED})\n`);

const sorted = [...TYPE_IDS].sort((a, b) => counts[b] - counts[a]);
for (const id of sorted) {
  const pct = (counts[id] / N) * 100;
  const flag = pct === 0 ? '  ← 출현율 0%' : pct > MAX_SHARE ? `  ← ${MAX_SHARE}% 초과` : '';
  console.log(`${id.padEnd(22)}${pct.toFixed(1).padStart(5)}%  ${'█'.repeat(Math.round(pct))}${flag}`);
}

const shares = sorted.map(id => (counts[id] / N) * 100);
console.log(`\n최대 ${shares[0].toFixed(1)}% / 최소 ${shares[shares.length - 1].toFixed(1)}%`);
console.log(`subtype이 붙는 경계 사용자: ${((withSubtype / N) * 100).toFixed(1)}%`);
