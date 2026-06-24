'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getCurrentUser, clearCurrentUser } from '@/utils/currentUser';
import { hashPassword } from '@/utils/password';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import {
  Award, BookOpen, TrendingUp, Loader2, Clock, Pencil, PlusCircle,
  X, Save, CheckCircle2, Mic, Languages, ChevronRight,
  ShieldCheck, LogOut, Flame, Target,
} from 'lucide-react';
import { computeStreak } from '@/utils/streak';
import { evaluateBadges } from '@/utils/badges';

const TOTAL_ROADMAP_ITEMS = 145;

// ── ロードマップのセクション定義（roadmap/page.tsx と同期） ──
const ROADMAP_SECTIONS = [
  { key: 'pronunciation',        label: '発音',                    total: 47,  color: 'bg-pink-500',    text: 'text-pink-600'    },
  { key: 'grammar_evine',        label: '英文法 Mr.Evine',         total: 29,  color: 'bg-blue-500',    text: 'text-blue-600'    },
  { key: 'grammar_evergreen',    label: '英文法 Evergreen',        total: 24,  color: 'bg-indigo-500',  text: 'text-indigo-600'  },
  { key: 'vocab_kikutan_entry',  label: 'キクタン Entry',          total: 15,  color: 'bg-green-500',   text: 'text-green-600'   },
  { key: 'vocab_kikutan_basic',  label: 'キクタン Basic',          total: 10,  color: 'bg-emerald-500', text: 'text-emerald-600' },
  { key: 'vocab_kikutan_advanced', label: 'キクタン Advanced',     total: 10,  color: 'bg-teal-500',    text: 'text-teal-600'    },
  { key: 'vocab_database',       label: 'Database 3300',           total: 6,   color: 'bg-cyan-500',    text: 'text-cyan-600'    },
  { key: 'vocab_duo',            label: 'DUO 3.0',                 total: 45,  color: 'bg-violet-500',  text: 'text-violet-600'  },
];

// セクションキー → アイテムIDプレフィックスのマッピング
const SECTION_ID_PREFIXES: Record<string, string[]> = {
  pronunciation:          ['p'],
  grammar_evine:          ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12','g13','g14','g15','g16','g17','g18','g19','g20','g21','g22','g23','g24','g25','g26','g27','g28','g29'],
  grammar_evergreen:      ['g30','g31','g32','g33','g34','g35','g36','g37','g38','g39','g40','g41','g42','g43','g44','g45','g46','g47','g48','g49','g50','g51','g52','g53'],
  vocab_kikutan_entry:    ['v-e'],
  vocab_kikutan_basic:    ['v-b'],
  vocab_kikutan_advanced: ['v-a'],
  vocab_database:         ['v-d'],
  vocab_duo:              ['v-duo'],
};

type QuizResult = {
  id: string;
  category: string;
  book_name: string | null;
  chapter: string | null;
  score: number;
  total: number;
  taken_at: string;
};

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  weekly_goal_minutes: number | null;
};

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(150);
  const [streak, setStreak] = useState({ current: 0, longest: 0, studiedToday: false });
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
　const [surveyDone, setSurveyDone] = useState(true);

  // モーダル
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState(150);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initialize = async () => {
      const user = getCurrentUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // プロフィール
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      if (prof?.weekly_goal_minutes != null) setWeeklyGoal(prof.weekly_goal_minutes);

      // 受験履歴
      const { data: qr } = await supabase.from('quiz_results').select('*').eq('user_id', user.id).order('taken_at', { ascending: false });
      setResults(qr ?? []);

      // ロードマップ進捗
      const { data: rp } = await supabase.from('roadmap_progress').select('item_key').eq('user_id', user.id).eq('is_completed', true);
      setCompletedIds(new Set((rp ?? []).map(d => d.item_key)));

      // アンケート完了確認
      const { data: sp } = await supabase.from('student_profiles').select('id').eq('id', user.id).single();
      setSurveyDone(!!sp);

      // 学習時間
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoff = sevenDaysAgo.toISOString().split('T')[0];
      const { data: logs } = await supabase.from('study_logs').select('study_time_minutes, study_date').eq('user_id', user.id);
      const total = logs?.reduce((a, l) => a + (l.study_time_minutes || 0), 0) || 0;
      const weekly = logs?.filter(l => l.study_date >= cutoff).reduce((a, l) => a + (l.study_time_minutes || 0), 0) || 0;
      setTotalMinutes(total);
      setWeeklyMinutes(weekly);
      setStreak(computeStreak((logs ?? []).map(l => l.study_date)));

      setLoading(false);
    };
    initialize();
  }, []);

  // ログイン直後（/login → /mypage?loggedIn=true）に完了トーストを表示。
  // ローディング完了後に出す（読み込み中に3秒が経過して消えるのを防ぐ）。
  useEffect(() => {
    if (!loading && new URLSearchParams(window.location.search).get('loggedIn') === 'true') {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // セクションごとの完了数を計算
  const getSectionProgress = (sectionKey: string, total: number) => {
    const prefixes = SECTION_ID_PREFIXES[sectionKey];
    if (!prefixes) return 0;

    // grammar_evine / grammar_evergreen はID完全一致で判定
    if (sectionKey === 'grammar_evine') {
      const done = prefixes.filter(id => completedIds.has(id)).length;
      return Math.round((done / total) * 100);
    }
    if (sectionKey === 'grammar_evergreen') {
      const done = prefixes.filter(id => completedIds.has(id)).length;
      return Math.round((done / total) * 100);
    }

    // その他はプレフィックス前方一致
    const done = [...completedIds].filter(id => prefixes.some(p => id.startsWith(p))).length;
    return Math.round((done / total) * 100);
  };

  const openModal = () => {
    setEditName(profile?.display_name || '');
    setEditGoal(profile?.weekly_goal_minutes ?? weeklyGoal);
    setNewPassword('');
    setConfirmPassword('');
    setPwError('');
    setSaved(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setPwError('');

    // パスワード変更（入力された場合のみ）
    if (newPassword || confirmPassword) {
      if (newPassword.length < 4) { setPwError('パスワードは4文字以上で入力してください'); return; }
      if (newPassword !== confirmPassword) { setPwError('パスワードが一致しません'); return; }
    }

    setSaving(true);
    const goal = Math.max(0, Math.round(editGoal));
    const update: { display_name: string; weekly_goal_minutes: number; password_hash?: string } = {
      display_name: editName.trim(),
      weekly_goal_minutes: goal,
    };
    if (newPassword) update.password_hash = await hashPassword(newPassword);

    await supabase.from('profiles').update(update).eq('id', user.id);
    setProfile(p => p ? { ...p, display_name: editName.trim(), weekly_goal_minutes: goal } : p);
    setWeeklyGoal(goal);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setModalOpen(false), 800);
  };

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  const totalAttempts = results.length;
  const avgPct = totalAttempts > 0
    ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / totalAttempts) : 0;
  const bestPct = totalAttempts > 0
    ? Math.max(...results.map(r => Math.round((r.score / r.total) * 100))) : 0;

  const roadmapPercent = Math.round((completedIds.size / TOTAL_ROADMAP_ITEMS) * 100);
  const goalPercent = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyMinutes / weeklyGoal) * 100)) : 0;
  const badges = evaluateBadges({
    totalMinutes,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    roadmapPercent,
    quizAttempts: totalAttempts,
    avgQuizPercent: avgPct,
  });
  const earnedBadges = badges.filter(b => b.earned);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Student';
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* ログイン完了トースト */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl">
            <CheckCircle2 size={20} className="text-green-400 shrink-0" />
            <p className="font-bold text-sm">ログインが完了しました 🎉</p>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto p-6 mt-4 space-y-8">

        {/* ── アンケート未回答アラート ── */}
        {!surveyDone && (
          <Link href="/onboarding" className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 hover:bg-amber-100 transition-all">
            <div>
              <p className="text-sm font-black text-amber-700">📋 初回アンケートが未回答です</p>
              <p className="text-xs text-amber-500 font-medium mt-0.5">タップして回答してください（約3分）</p>
            </div>
            <ChevronRight size={18} className="text-amber-500 shrink-0" />
          </Link>
        )}

        {/* ── プロフィールヘッダー ── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-gray-900 truncate">{displayName}</h1>
            <p className="text-sm text-gray-400 font-medium truncate mt-0.5">{user?.email}</p>
            {profile?.role && (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-lg">
                {profile.role}
              </span>
            )}
          </div>
          <button
            onClick={openModal}
            className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0"
          >
            <Pencil size={18} />
          </button>
        </div>

        {/* ── 今日の学習を記録 CTA（学習記録ページへ） ── */}
        <Link
          href="/dashboard"
          className="flex items-center justify-between gap-4 bg-indigo-600 text-white rounded-3xl px-6 py-5 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.99] transition-all"
        >
          <span className="flex items-center gap-3">
            <PlusCircle size={22} />
            <span className="font-black">今日の学習を記録する</span>
          </span>
          <ChevronRight size={20} className="shrink-0" />
        </Link>

        {/* ── 統計カード ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">学習統計</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={<Flame size={16} className="text-orange-400" />}      value={`${streak.current}日`}  label="連続学習" valueColor="text-orange-500" />
            <StatCard icon={<BookOpen size={16} className="text-indigo-400" />} value={`${totalAttempts}`}    label="受験回数" />
            <StatCard icon={<TrendingUp size={16} className="text-indigo-400" />} value={`${avgPct}%`}        label="平均正答率" />
            <StatCard icon={<Award size={16} className="text-yellow-400" />}      value={`${bestPct}%`}       label="最高正答率" valueColor="text-yellow-500" />
            <StatCard icon={<Clock size={16} className="text-blue-400" />}        value={`${(totalMinutes/60).toFixed(1)}h`}  label="総学習時間" />
            <StatCard icon={<Clock size={16} className="text-green-400" />}       value={`${(weeklyMinutes/60).toFixed(1)}h`} label="今週の学習時間" valueColor="text-green-600" />
          </div>
        </div>

        {/* ── 今週の目標 ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">今週の目標</p>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Target size={16} className="text-indigo-500" /> 週 {weeklyGoal} 分
              </span>
              <span className="text-sm font-black text-gray-700">
                {weeklyMinutes}<span className="text-gray-400 font-bold"> / {weeklyGoal} 分</span>
              </span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${goalPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-bold text-gray-400">
                {goalPercent >= 100 ? '🎉 目標達成！' : `達成率 ${goalPercent}% ・ あと ${Math.max(0, weeklyGoal - weeklyMinutes)} 分`}
              </p>
              <button onClick={openModal} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                目標を変更
              </button>
            </div>
          </div>
        </div>

        {/* ── バッジ ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">
            獲得バッジ <span className="text-gray-400">{earnedBadges.length} / {badges.length}</span>
          </p>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {badges.map((b) => (
                <div
                  key={b.key}
                  title={`${b.label}：${b.desc}${b.earned ? '' : `（達成率 ${b.progress}%）`}`}
                  className={`flex flex-col items-center text-center rounded-2xl p-3 border transition-all ${
                    b.earned
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <span className={`text-3xl leading-none mb-1.5 ${b.earned ? '' : 'grayscale opacity-30'}`}>{b.emoji}</span>
                  <span className={`text-[11px] font-bold leading-tight ${b.earned ? 'text-gray-700' : 'text-gray-400'}`}>{b.label}</span>
                  {!b.earned && b.progress > 0 && (
                    <span className="text-[10px] font-bold text-gray-300 mt-0.5">{b.progress}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ロードマップ進捗サマリー（英語学習者のみ。ロードマップは英語向けの内容） ── */}
        {user?.subject !== 'ja' && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">ロードマップ進捗</p>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            {ROADMAP_SECTIONS.map(sec => {
              const pct = getSectionProgress(sec.key, sec.total);
              if (pct === 0) return null; // 未着手セクションは非表示
              return (
                <div key={sec.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-gray-700">{sec.label}</span>
                    <span className={`text-sm font-black ${sec.text}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`${sec.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {ROADMAP_SECTIONS.every(sec => getSectionProgress(sec.key, sec.total) === 0) && (
              <p className="text-center text-gray-300 font-bold py-4 text-sm">
                まだロードマップを開始していません
              </p>
            )}
          </div>
        </div>
        )}

        {/* ── 受験履歴 ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">受験履歴</p>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((r) => {
                const pct = Math.round((r.score / r.total) * 100);
                const isPerfect = pct === 100;
                const isGood = pct >= 70;
                const colorClass = isPerfect ? 'text-yellow-500' : isGood ? 'text-indigo-600' : 'text-red-500';
                const bgClass = isPerfect ? 'bg-yellow-50 border-yellow-100' : isGood ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100';
                return (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {r.category}
                        {r.book_name && <span className="text-gray-400 font-medium"> / {r.book_name}</span>}
                        {r.chapter && <span className="text-gray-400 font-medium"> / {r.chapter}</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.taken_at).toLocaleDateString('ja-JP', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className={`text-center px-4 py-2 rounded-xl border ${bgClass}`}>
                      <p className={`text-xl font-black ${colorClass}`}>{r.score}/{r.total}</p>
                      <p className={`text-xs font-bold ${colorClass}`}>{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium">まだ受験履歴がありません</p>
              <Link href="/test" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all">
                テストを受ける
              </Link>
            </div>
          )}
        </div>

        {/* ── アカウント操作（スマホのみ。PCは上部ナビに集約） ── */}
        <div className="md:hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">アカウント</p>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            <Link href="/admin" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-all">
              <span className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <ShieldCheck size={18} className="text-red-500" /> 管理画面
              </span>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-all">
              <span className="flex items-center gap-3 text-sm font-bold text-red-600">
                <LogOut size={18} /> 利用者を切り替え
              </span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="h-20 md:hidden" />
      </main>

      <BottomNav />

      {/* ── プロフィール編集モーダル ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">プロフィール編集</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* アバタープレビュー */}
            <div className="flex justify-center mb-6">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-400 font-medium mb-6">
              アバターはGoogleアカウントの画像を使用しています
            </p>

            <div className="mb-5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">表示名</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                placeholder="表示名を入力"
              />
            </div>

            {/* ── 週の学習目標 ── */}
            <div className="mb-5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">週の学習目標</label>
              <div className="flex flex-wrap gap-2">
                {[90, 150, 300, 600].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEditGoal(m)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                      editGoal === m
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {m < 60 ? `${m}分` : `${m / 60}時間`}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={0}
                  step={30}
                  value={editGoal}
                  onChange={e => setEditGoal(Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
                <span className="text-sm font-medium text-gray-400">分 / 週</span>
              </div>
            </div>

            {/* ── パスワード変更（任意） ── */}
            <div className="mb-2 pt-4 border-t border-gray-100">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">パスワード変更（任意）</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPwError(''); }}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all mb-2"
                placeholder="新しいパスワード"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPwError(''); }}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                placeholder="新しいパスワード（確認）"
              />
              <p className="text-[11px] text-gray-400 font-medium mt-1.5">変更しない場合は空欄のままにしてください</p>
            </div>
            {pwError && <p className="text-red-500 text-sm font-bold mb-4">{pwError}</p>}

            <button
              onClick={handleSave}
              disabled={saving || saved || !editName.trim()}
              className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50
                bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {saving ? <Loader2 size={17} className="animate-spin" />
                : saved ? <><CheckCircle2 size={17} /> 保存しました</>
                : <><Save size={17} /> 保存する</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 統計カード ────────────────────────────────────────────
function StatCard({ icon, value, label, valueColor = 'text-gray-900' }: {
  icon: React.ReactNode; value: string; label: string; valueColor?: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}
