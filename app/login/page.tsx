'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { setCurrentUser } from '@/utils/currentUser';
import { normalizeSubject } from '@/utils/subject';
import { verifyPassword } from '@/utils/password';
import { Loader2, Star, UserCircle, Lock } from 'lucide-react';

type Profile = {
  id: string;
  display_name: string | null;
  student_id: string | null;
  subject: string | null;
  password_hash: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const submit = async () => {
    const idf = identifier.trim();
    if (!idf) {
      setError('名前または ID を入力してください');
      return;
    }
    setVerifying(true);
    setError('');

    // 名前 / ID の完全一致で利用者を検索（一覧は表示しない）。
    // .or のフィルタ文字列パースを避けるため eq を 2 本並列で投げて結合する。
    const [byName, byId] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, student_id, subject, password_hash')
        .eq('display_name', idf),
      supabase
        .from('profiles')
        .select('id, display_name, student_id, subject, password_hash')
        .eq('student_id', idf),
    ]);

    if (byName.error || byId.error) {
      setError('ログインに失敗しました。もう一度お試しください。');
      setVerifying(false);
      return;
    }

    const seen = new Set<string>();
    const matches: Profile[] = [];
    for (const p of [...(byName.data ?? []), ...(byId.data ?? [])]) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        matches.push(p as Profile);
      }
    }

    if (matches.length === 0) {
      setError('該当する利用者が見つかりません');
      setVerifying(false);
      return;
    }

    // 同名がいる場合に備え、パスワードが一致する利用者を探す。
    let authed: Profile | null = null;
    for (const m of matches) {
      if (await verifyPassword(password, m.password_hash)) {
        authed = m;
        break;
      }
    }

    if (!authed) {
      setError('パスワードが違います');
      setVerifying(false);
      return;
    }

    setCurrentUser({
      id: authed.id,
      name: authed.display_name || '名称未設定',
      subject: normalizeSubject(authed.subject),
    });
    router.push('/mypage?loggedIn=true');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/" className="flex justify-center items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Star className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">Learning Support</span>
        </a>
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">ログイン</h2>
        <p className="text-center text-gray-400 mt-2 font-medium">名前（または ID）とパスワードを入力してください</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100">
          {/* 名前 / ID */}
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">名前 / ID</label>
          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-2xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
            <UserCircle size={18} className="text-gray-400" />
            <input
              type="text"
              value={identifier}
              onChange={e => { setIdentifier(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="名前 または ID"
              autoFocus
              className="flex-1 text-sm font-medium outline-none bg-transparent"
            />
          </div>

          {/* パスワード */}
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">パスワード</label>
          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-2xl px-4 py-3 mb-1 focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
            <Lock size={18} className="text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="未登録の場合は空欄のまま"
              className="flex-1 text-sm font-medium outline-none bg-transparent"
            />
          </div>
          <p className="text-[11px] text-gray-400 font-medium ml-1 mb-2">パスワード未登録の方は空欄のままログインできます</p>

          {error && <p className="text-red-500 text-sm font-bold mb-2">{error}</p>}

          <button
            onClick={submit}
            disabled={verifying}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-2"
          >
            {verifying ? <Loader2 size={18} className="animate-spin" /> : null}
            ログイン
          </button>

          <p className="text-center text-xs text-gray-400 font-medium pt-5">
            ログインできない場合は管理者にお問い合わせください
          </p>
        </div>
      </div>
    </div>
  );
}
