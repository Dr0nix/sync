import {
  AXES, BALANCE_BAND, PROTOTYPES, SUBTYPE_GAP, TYPE_IDS,
  type Axes, type Prototype, type TypeId,
} from './prototypes.ts';

export function weightedDistance(user: Axes, p: Prototype): number {
  let sum = 0, wsum = 0;
  for (const k of AXES) {
    const w = p.weights[k];
    sum  += w * (user[k] - p.vector[k]) ** 2;
    wsum += w;
  }
  return Math.sqrt(sum / wsum);   // ← wsum으로 나누지 않으면 타입 간 비교 불가
}

export function resolveType(
  user: Axes,
  prototypes: Record<TypeId, Prototype> = PROTOTYPES,
): { typeId: TypeId; subtypeId: TypeId | null } {
  if (AXES.every(k => Math.abs(user[k] - 50) < BALANCE_BAND)) {
    return { typeId: 'balance_player', subtypeId: null };
  }

  const ranked = TYPE_IDS
    .filter(id => id !== 'balance_player')
    .map(id => ({ id, d: weightedDistance(user, prototypes[id]) }))
    .sort((a, b) => a.d - b.d);

  // 1·2등이 거의 붙어 있으면 경계 사용자 → 2등을 subtype으로
  const subtypeId = (ranked[1].d - ranked[0].d) < SUBTYPE_GAP ? ranked[1].id : null;
  return { typeId: ranked[0].id, subtypeId };
}
