// 공유 이미지 공통 틀. 서버 전용.
// 이미지 생성이 이 서비스에서 CPU를 가장 많이 쓰므로, 한 번 만든 이미지는 CDN이 오래 들고 있게 한다(스펙 §1).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactElement, ReactNode } from 'react';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

// 크롤러가 반복 요청해도 다시 그리지 않도록 공유 캐시(CDN)에 하루 둔다. 라우트의 revalidate와 같은 주기다.
export const OG_CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

// 닉네임에 어떤 한글이 올지 몰라서 전체 한글이 들어 있는 파일을 쓴다. 요청마다 읽지 않고 한 번만 읽는다.
const font = (file: string) => readFile(join(process.cwd(), 'assets', 'fonts', file));
const fonts = Promise.all([font('Pretendard-SemiBold.otf'), font('Pretendard-Bold.otf')]);

export const COLOR = {
  violet: '#7c3aed',
  violetLight: '#ddd6fe',
  violetPale: '#f5f3ff',
  ink: '#18181b',
  gray: '#71717a',
  line: '#e4e4e7',
  white: '#ffffff',
};

export async function renderImage(
  element: ReactElement,
  options: { width?: number; height?: number; cacheControl?: string } = {},
): Promise<ImageResponse> {
  const [semiBold, bold] = await fonts;
  return new ImageResponse(element, {
    width: options.width ?? OG_SIZE.width,
    height: options.height ?? OG_SIZE.height,
    fonts: [
      { name: 'Pretendard', data: semiBold, style: 'normal', weight: 600 },
      { name: 'Pretendard', data: bold, style: 'normal', weight: 700 },
    ],
    headers: { 'Cache-Control': options.cacheControl ?? OG_CACHE_CONTROL },
  });
}

// 보라색 바탕의 가로형 카드. 캡처 한 장으로 서비스가 보여야 한다(스펙 §19).
// 이모지는 그릴 폰트가 없어서 쓰지 않는다.
export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '56px 80px', backgroundColor: COLOR.violet, color: COLOR.white,
        fontFamily: 'Pretendard', fontWeight: 700,
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, letterSpacing: 10, color: COLOR.violetLight }}>SYNC</div>
      {children}
    </div>
  );
}

// 긴 닉네임이 카드를 넘지 않도록 줄인다.
export const fit = (text: string, max: number) => {
  const chars = [...text];
  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : text;
};
