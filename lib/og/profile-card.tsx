// 개인 결과 이미지(세로형). 본인이 저장해서 스토리 등에 올리는 용도다.
import type { ProfileResult } from '../api/profile-result.ts';
import { AXIS_LABELS } from '../content/axis-labels.ts';
import { COLOR, fit } from './card.tsx';

export const PROFILE_IMAGE_SIZE = { width: 1080, height: 1920 };

type Props = Pick<ProfileResult, 'nickname' | 'axes'> & { typeName: string; tagline: string };

// 양극형 막대. 가운데 50에서 점수 쪽으로 채운다(결과 화면의 BipolarTasteBar와 같은 표현).
function Bar({ left, right, score }: { left: string; right: string; score: number }) {
  const value = Math.min(100, Math.max(0, score));
  const leansRight = value > 50, leansLeft = value < 50;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 44 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34 }}>
        <div style={{ display: 'flex', fontWeight: leansLeft ? 700 : 600, color: leansLeft ? COLOR.ink : COLOR.gray }}>{left}</div>
        <div style={{ display: 'flex', fontWeight: leansRight ? 700 : 600, color: leansRight ? COLOR.ink : COLOR.gray }}>{right}</div>
      </div>
      <div style={{ display: 'flex', position: 'relative', width: '100%', height: 28, marginTop: 14, borderRadius: 14, backgroundColor: COLOR.line }}>
        <div
          style={{
            position: 'absolute', top: 0, height: 28, borderRadius: 14, backgroundColor: COLOR.violet,
            left: `${Math.min(value, 50)}%`, width: `${Math.abs(value - 50)}%`,
          }}
        />
        <div style={{ position: 'absolute', top: -6, left: '50%', width: 4, height: 40, marginLeft: -2, backgroundColor: COLOR.gray }} />
      </div>
    </div>
  );
}

export function ProfileCard({ nickname, typeName, tagline, axes }: Props) {
  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        backgroundColor: COLOR.white, color: COLOR.ink, fontFamily: 'Pretendard', fontWeight: 700,
      }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', padding: '120px 84px 96px',
          backgroundColor: COLOR.violet, color: COLOR.white,
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, letterSpacing: 10, color: COLOR.violetLight }}>SYNC</div>
        <div style={{ display: 'flex', marginTop: 72, fontSize: 48, fontWeight: 600, color: COLOR.violetLight }}>
          {fit(nickname, 12)}님은
        </div>
        <div style={{ display: 'flex', marginTop: 12, fontSize: 112, lineHeight: 1.2 }}>{typeName}</div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 46, fontWeight: 600, lineHeight: 1.4 }}>{tagline}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '72px 84px 0' }}>
        <div style={{ display: 'flex', fontSize: 50 }}>취향 DNA</div>
        {AXIS_LABELS.map(({ axis, left, right }) => (
          <Bar key={axis} left={left} right={right} score={axes[axis]} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 84px 84px', fontSize: 38, fontWeight: 600, color: COLOR.gray }}>
        나는 대체 무슨 타입일까?
      </div>
    </div>
  );
}
