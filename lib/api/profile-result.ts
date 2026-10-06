// GET /api/profile/[id] 응답 형태. Route Handler와 결과 화면이 같이 쓴다.
import type { Axes, TypeId } from '../scoring/v1/prototypes.ts';

export type ProfileResult = {
  profileId: string;
  nickname: string;
  type: { id: TypeId; name: string; tagline: string };
  subtype: { id: TypeId; name: string } | null;
  axes: Axes;
  insights: string[];
  paradoxes: string[];
};
