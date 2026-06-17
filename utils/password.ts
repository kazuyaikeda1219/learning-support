// ────────────────────────────────────────────────────────────
// ログイン用パスワードのハッシュ化。
// 認証なし運用のため Supabase Auth は使わず、profiles.password_hash に
// SHA-256(hex) を保存し、ログイン時にクライアントで照合する。
// ⚠️ anon キーで読める前提なので強固な認証ではない（簡易ロック）。
// ────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(input: string, storedHash: string | null | undefined): Promise<boolean> {
  // 未設定(null/空)の場合はパスワードなしでログイン可能（後方互換）
  if (!storedHash) return true;
  const inputHash = await hashPassword(input);
  return inputHash === storedHash;
}
