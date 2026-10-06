// 선택지 표시 순서. 항상 a → b로 보여주면 첫 번째를 누르는 습관이 축 점수 편향이 된다.
// seed(익명 토큰)와 문항으로 순서를 정하므로 같은 사람은 같은 문항을 늘 같은 순서로 본다. 순서는 저장하지 않는다.

// FNV-1a 32비트
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

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

// 0..count-1을 섞은 순열. 같은 입력이면 항상 같은 순서다.
export function optionOrder(seed: string, questionId: string, count: number): number[] {
  const rand = mulberry32(hash(`${seed}:${questionId}`));
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
