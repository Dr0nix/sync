// 사이트 기본 공유 이미지. 따로 이미지를 두지 않은 모든 페이지에 쓰인다.
import { COLOR, Card, OG_CONTENT_TYPE, OG_SIZE, renderImage } from '@/lib/og/card.tsx';

export const alt = 'SYNC — 나는 대체 무슨 타입일까?';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderImage(
    <Card>
      <div style={{ display: 'flex', marginTop: 36, fontSize: 84, lineHeight: 1.2 }}>나는 대체 무슨 타입일까?</div>
      <div style={{ display: 'flex', marginTop: 28, fontSize: 36, fontWeight: 600, color: COLOR.violetLight }}>
        내가 직접 고른 취향 60개로 알아보는 내 타입
      </div>
    </Card>,
  );
}
