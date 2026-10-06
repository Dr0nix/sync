// POST /api/test/submit — responses 저장 → 채점 → profiles 캐시 갱신 → profileId 반환 (스펙 §6.3)
import { parseSubmit } from '@/lib/api/submit-input.ts';
import { saveSubmission } from '@/lib/db/profiles.ts';
import { loadQuestions } from '@/lib/db/questions.ts';

const error = (status: number, message: string) => Response.json({ error: message }, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, '요청 본문이 올바르지 않습니다.');
  }

  const questions = await loadQuestions();
  const parsed = parseSubmit(body, questions);
  if (!parsed.ok) return error(400, parsed.error);

  const saved = await saveSubmission(parsed.value, questions);
  if (saved === 'conflict') return error(409, '이미 제출된 응답입니다.');

  return Response.json({ profileId: saved.profileId });
}
