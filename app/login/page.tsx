'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { setCurrentUser } from '@/utils/currentUser';
import { normalizeSubject } from '@/utils/subject';
import { verifyPassword } from '@/utils/password';
import { Loader2, Star, Search, ChevronRight, UserCircle, Lock, ArrowLeft } from 'lucide-react';

type Profile = { id: string; display_name: string | null; student_id: string | null; subject: string | null };

export default function SelectUserPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // パスワード入力ステップ
  const [selected, setSelected] = useState<Profile | null>(null);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, student_id, subject')
        .order('display_name', { ascending: true });
      setProfiles(data ?? []);
      setLoading(false);
    })();
  }, []);

  const pick = (p: Profile) => {
    setSelected(p);
    setPassword('');
    setPwError('');
  };

  const back = () => {
    setSelected(null);
    setPassword('');
    setPwError('');
  };

  const submitPassword = async () => {
    if (!selected) return;
    setVerifying(true);
    setPwError('');

    // 選択した利用者の保存済みパスワードハッシュを取得して照合
    const { data, error } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', selected.id)
      .single();

    if (error) {
      setPwError('ログインに失敗しました。もう一度お試しください。');
      setVerifying(false);
      return;
    }

    const ok = await verifyPassword(password, data?.password_hash ?? null);
    if (!ok) {
      setPwError('パスワードが違います');
      setVerifying(false);
      return;
    }

    setCurrentUser({
      id: selected.id,
      name: selected.display_name || '名称未設定',
      subject: normalizeSubject(selected.subject),
    });
    router.push('/mypage?loggedIn=true');
  };

  const filtered = profiles.filter(p => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.display_name || '').toLowerCase().includes(q) ||
      (p.student_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/" className="flex justify-center items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Star className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">Learning Support</span>
        </a>
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
          {selected ? 'パスワードを入力' : '利用者を選択'}
        </h2>
        <p className="text-center text-gray-400 mt-2 font-medium">
          {selected ? `${selected.display_name || '名称未設定'} さんとしてログイン` : 'あなたの名前を選んで開始してください'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100">

          {selected ? (
            /* ── パスワード入力ステップ ── */
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl mb-3">
                  {(selected.display_name || '?').charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-gray-800">{selected.display_name || '名称未設定'}</p>
              </div>

              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-2xl px-4 py-3 mb-2 focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwError(''); }}
                  onKeyDown={e => e.key === 'Enter' && submitPassword()}
                  placeholder="パスワード"
                  autoFocus
                  className="flex-1 text-sm font-medium outline-none bg-transparent"
                />
              </div>
              {pwError && <p className="text-red-500 text-sm font-bold mb-2">{pwError}</p>}

              <button
                onClick={submitPassword}
                disabled={verifying}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-2"
              >
                {verifying ? <Loader2 size={18} className="animate-spin" /> : null}
                ログイン
              </button>
              <button
                onClick={back}
                className="w-full mt-3 text-gray-400 text-sm font-bold flex items-center justify-center gap-1.5 hover:text-gray-600 transition-all"
              >
                <ArrowLeft size={14} /> 利用者一覧に戻る
              </button>
              <p className="text-center text-xs text-gray-400 font-medium pt-5">
                パスワードが分からない場合は管理者にお問い合わせください
              </p>
            </div>
          ) : (
            /* ── 利用者選択ステップ ── */
            <>
              {/* 検索 */}
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-2xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="名前 / ID で検索"
                  className="flex-1 text-sm font-medium outline-none bg-transparent"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-gray-300 font-bold py-12 text-sm">
                  {profiles.length === 0 ? '登録された利用者がいません。\n管理者に登録を依頼してください。' : '該当する利用者が見つかりません'}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => pick(p)}
                      className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-indigo-50 rounded-2xl px-5 py-3.5 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                          {(p.display_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-bold text-gray-800 text-sm truncate">{p.display_name || '名称未設定'}</p>
                          {p.student_id && <p className="text-[11px] text-gray-400 font-bold">ID: {p.student_id}</p>}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center text-xs text-gray-400 font-medium pt-5 flex items-center justify-center gap-1.5">
                <UserCircle size={13} /> 一覧に名前がない場合は管理者に登録を依頼してください
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
