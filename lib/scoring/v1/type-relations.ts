// 타입 소개 페이지의 "닮은 타입 / 정반대 타입". Prototype 좌표 사이의 거리로 고른다.
// 좌표를 조정하면 결과도 따라 바뀐다. 문장으로 적어 두지 않는다.
import { AXES, PROTOTYPES, TYPE_IDS, type Prototype, type TypeId } from './prototypes.ts';

// 좌표끼리의 거리. 가중치는 타입마다 달라서 쓰면 A→B와 B→A가 달라진다. 그래서 대칭인 단순 거리를 쓴다.
export function vectorDistance(a: Prototype, b: Prototype): number {
  return Math.sqrt(AXES.reduce((sum, k) => sum + (a.vector[k] - b.vector[k]) ** 2, 0));
}

// balance_player는 전 축이 가운데라 닮은·정반대가 성립하지 않는다. 자기 자신으로도, 남의 후보로도 쓰지 않는다.
export function relatedTypes(
  typeId: TypeId,
  prototypes: Record<TypeId, Prototype> = PROTOTYPES,
): { similar: TypeId; opposite: TypeId } | null {
  if (typeId === 'balance_player') return null;

  const ranked = TYPE_IDS
    .filter(id => id !== typeId && id !== 'balance_player')
    .map(id => ({ id, d: vectorDistance(prototypes[typeId], prototypes[id]) }))
    .sort((x, y) => x.d - y.d || x.id.localeCompare(y.id));

  return { similar: ranked[0].id, opposite: ranked[ranked.length - 1].id };
}
