import Link from 'next/link';
import { ResumeLink } from '@/components/ResumeLink.tsx';
import { TasteDna } from '@/components/TasteDna.tsx';
import { TypeHeroCard } from '@/components/TypeHeroCard.tsx';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';
import { PROTOTYPES, type TypeId } from '@/lib/scoring/v1/prototypes.ts';

// TODO: 확정 필요 — 임시값 (미리보기 카드에 쓸 예시 타입과 닉네임)
const PREVIEW_TYPE: TypeId = 'planned_hedonist';
const PREVIEW_NICKNAME = '○○';

// 메인(/)과 초대 화면(/i/[inviteCode])이 같이 쓴다. 초대 화면에서도 초대자 정보는 보여주지 않는다.
// 서버 컴포넌트. 타입 데이터는 여기서 읽어 HTML로만 내려간다.
export function Landing() {
  const preview = TYPE_CONTENT[PREVIEW_TYPE];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-5 pt-10 pb-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-bold tracking-widest text-violet-600">SYNC</p>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight break-keep">
          나는 대체 무슨 타입일까?
        </h1>
        <p className="text-lg text-zinc-600 break-keep">
          내가 직접 고른 취향 60개로 알아보는 내 타입.
        </p>
      </header>

      <div className="flex flex-col gap-2" aria-label="결과 예시">
        <p className="text-sm font-medium text-zinc-500">이런 결과가 나와요</p>
        <div className="flex flex-col gap-5 rounded-3xl border border-zinc-200 p-3 pb-5">
          <TypeHeroCard nickname={PREVIEW_NICKNAME} name={preview.name} tagline={preview.tagline} />
          <div className="px-2">
            <TasteDna axes={PROTOTYPES[PREVIEW_TYPE].vector} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto flex flex-col gap-1 bg-gradient-to-t from-white from-80% to-transparent pt-6 pb-2">
        <Link
          href="/test"
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700"
        >
          내 취향 알아보기
        </Link>
        <ResumeLink />
      </div>
    </main>
  );
}
