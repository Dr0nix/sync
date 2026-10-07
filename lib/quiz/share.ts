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

export type SaveOutcome = 'shared' | 'saved' | 'cancelled';

// 이미지를 기기의 공유 창으로 넘기거나(휴대폰), 파일로 내려받는다.
export async function saveImage(blob: Blob, filename: string): Promise<SaveOutcome> {
  const file = new File([blob], filename, { type: blob.type });
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return 'saved';
}
