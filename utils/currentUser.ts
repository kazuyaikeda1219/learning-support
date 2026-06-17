'use client';

// ────────────────────────────────────────────────────────────
// 認証なし運用の「現在の利用者」管理。
// ログインの代わりに、入口(/login)で登録済みプロフィールを選び、
// その id/name を localStorage に保持する。各ページはこれを参照して
// 個人別データ(study_logs / roadmap_progress / quiz_results 等)を読み書きする。
// ────────────────────────────────────────────────────────────

import { normalizeSubject, type Subject } from './subject';

export type CurrentUser = { id: string; name: string; subject: Subject };

const USER_KEY = 'ls_current_user';
const ADMIN_KEY = 'ls_admin_ok';

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CurrentUser>;
    if (!parsed?.id) return null;
    // 旧形式（subject 無し）でログイン済みの利用者は英語(en)に丸める
    return {
      id: parsed.id,
      name: parsed.name || '名称未設定',
      subject: normalizeSubject(parsed.subject),
    };
  } catch {
    return null;
  }
}

export function setCurrentUser(user: CurrentUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearCurrentUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}

// ── 管理画面のパスコードゲート ──────────────────────────────
export function isAdminUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_KEY) === '1';
}

export function checkAdminPasscode(input: string): boolean {
  const code = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'admin2026';
  return input.trim() === code;
}

export function unlockAdmin(): void {
  if (typeof window !== 'undefined') localStorage.setItem(ADMIN_KEY, '1');
}

export function lockAdmin(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_KEY);
}
