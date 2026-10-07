// POST /api/match, GET /api/match/[id] 응답 형태. Route Handler와 화면이 같이 쓴다.
import type { TypeId } from '../scoring/v1/prototypes.ts';

export type MatchDetail = {
  me: { type: { id: TypeId; name: string } | null };
  friend: { type: { id: TypeId; name: string } | null };
  categories: { id: string; label: string; score: number }[];
  matched: { question: string; answer: string }[];
  mismatched: { question: string; me: string; friend: string }[];
  goodAt: string[];
  clashAt: string[];
};

export type MatchResult = {
  matchId: string;
  score: number;
  grade: { name: string; copy: string };
  // 당사자가 보면 me가 본인이다. 제3자가 보면 저장 순서대로 두 사람이다.
  me: { nickname: string };
  friend: { nickname: string };
  // 당사자에게만 채워진다. 제3자에게는 null이다.
  detail: MatchDetail | null;
};
