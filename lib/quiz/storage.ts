// 브라우저 전용. localStorage에 익명 토큰, 응답 버퍼, 내 profileId를 둔다(스펙 §5.2, §6.5).
import { emptyDraft, restoreDraft, type Draft } from './draft.ts';
import type { TestQuestion } from './types.ts';

const TOKEN_KEY = 'sync.anonymousToken';
const DRAFT_KEY = 'sync.draft';
const PROFILE_KEY = 'sync.profileId';

// 사생활 보호 모드처럼 localStorage가 막힌 환경에서도 화면이 죽지 않게 한다.
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // 저장에 실패해도 진행은 메모리 상태로 이어진다.
  }
}

// crypto.randomUUID는 https·localhost에서만 있다. 같은 공유기의 휴대폰으로 http 접속해 볼 때를 위한 대체 경로.
function randomUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const readToken = (): string | null => read(TOKEN_KEY);

export function getOrCreateToken(): string {
  const existing = read(TOKEN_KEY);
  if (existing) return existing;
  const token = randomUuid();
  write(TOKEN_KEY, token);
  return token;
}

const profileListeners = new Set<() => void>();

export const readProfileId = (): string | null => read(PROFILE_KEY);

export function saveProfileId(profileId: string) {
  write(PROFILE_KEY, profileId);
  profileListeners.forEach(notify => notify());
}

export function subscribeProfileId(notify: () => void) {
  profileListeners.add(notify);
  return () => { profileListeners.delete(notify); };
}

// useSyncExternalStore에 물리는 응답 버퍼 저장소. 바뀔 때마다 localStorage에 쓴다.
export function createDraftStore(questions: TestQuestion[], version: number) {
  let current: Draft | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(notify: () => void) {
      listeners.add(notify);
      return () => { listeners.delete(notify); };
    },
    getSnapshot(): Draft {
      current ??= restoreDraft(read(DRAFT_KEY), questions, version);
      return current;
    },
    // 항상 최신 상태에서 다음 상태를 만든다. 렌더 사이에 연달아 호출돼도 앞의 변경이 사라지지 않는다.
    update(change: (draft: Draft) => Draft) {
      const next = change(this.getSnapshot());
      if (next === current) return;
      current = next;
      write(DRAFT_KEY, JSON.stringify(next));
      listeners.forEach(notify => notify());
    },
    clear() {
      current = emptyDraft(version);
      write(DRAFT_KEY, null);
      listeners.forEach(notify => notify());
    },
  };
}

export type DraftStore = ReturnType<typeof createDraftStore>;

// 초대 링크로 들어온 사람의 초대 코드. 테스트를 마치고 매치가 만들어질 때까지 기억한다.
const INVITE_KEY = 'sync.pendingInvite';

export const readPendingInvite = (): string | null => read(INVITE_KEY);
export const savePendingInvite = (code: string) => write(INVITE_KEY, code);
export const clearPendingInvite = () => write(INVITE_KEY, null);
