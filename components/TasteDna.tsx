import { AXIS_LABELS } from '@/lib/content/axis-labels.ts';
import type { ProfileResult } from '@/lib/api/profile-result.ts';
import { BipolarTasteBar } from './BipolarTasteBar.tsx';

// 취향 DNA: 막대 6개가 한 스크롤 안에 들어오게 한다.
export function TasteDna({ axes }: { axes: ProfileResult['axes'] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight">취향 DNA</h2>
      <div className="flex flex-col gap-4">
        {AXIS_LABELS.map(({ axis, left, right }) => (
          <BipolarTasteBar key={axis} left={left} right={right} score={axes[axis]} />
        ))}
      </div>
    </section>
  );
}
