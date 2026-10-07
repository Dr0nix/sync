// 브라우저 전용. 링크를 공유하거나 복사한다.

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // clipboard API는 https·localhost에서만 된다. 그 밖에서는 임시 입력창을 만들어 복사한다.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

// 기기의 공유 창이 있으면 그걸 띄우고, 없으면 링크를 복사한다.
export async function shareLink(link: { url: string; text: string }): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: link.text, url: link.url });
      return 'shared';
    } catch (err) {
      // 사용자가 공유 창을 닫은 경우. 다른 실패는 복사로 넘어간다.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(link.url)) ? 'copied' : 'failed';
}

// 이 기기가 파일 공유를 지원하는지. 지원한다고 답해도 실제 공유는 실패할 수 있다.
export function canShareFile(file: File): boolean {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

// 파일을 기기의 공유 창으로 넘긴다. 반드시 버튼을 누른 그 순간에 호출해야 한다.
// 누른 뒤에 이미지를 받아오느라 시간이 지나면 브라우저가 공유를 막는다.
export async function shareFile(file: File): Promise<'shared' | 'cancelled' | 'failed'> {
  try {
    await navigator.share({ files: [file] });
    return 'shared';
  } catch (err) {
    return err instanceof DOMException && err.name === 'AbortError' ? 'cancelled' : 'failed';
  }
}
