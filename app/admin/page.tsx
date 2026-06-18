'use client';

import Navbar from '@/components/Navbar';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRequireAdmin } from '@/utils/useRequireAdmin';
import { checkAdminPasscode, unlockAdmin } from '@/utils/currentUser';
import { hashPassword } from '@/utils/password';
import { SUBJECTS, SUBJECT_LABEL, type Subject } from '@/utils/subject';
import {
  ArrowLeft, Users, Clock, ChevronRight, Lock, Upload, Loader2, CheckCircle,
  LayoutDashboard, BookOpen, UserCheck, Plus, Pencil, Trash2, X, Save,
  TrendingUp, Activity, GraduationCap, ShieldCheck, Mail, AlertCircle, Layers
} from 'lucide-react';
import Link from 'next/link';

// ── 型定義 ──────────────────────────────────────────────
type Tab = 'summary' | 'students' | 'questions' | 'flashcards';

interface StudentRow {
  id: string;
  name: string;
  student_id: string;
  subject: string;
  role: string;
  progress: number;
  totalHours: string;
  weeklyHours: string;
  lastActive: string;
}

interface Question {
  id: string;
  subject: string;
  category: string;
  book_name: string;
  chapter: string;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option: number;
  explanation: string | null;
  q_type: string | null;
  correct_text: string | null;
  created_at: string;
}

interface AllowedEmail {
  id: string;
  email: string;
  created_at: string;
}

const EMPTY_QUESTION: Omit<Question, 'id' | 'created_at'> = {
  subject: 'en',
  category: '',
  book_name: '',
  chapter: '',
  question_text: '',
  option_1: '',
  option_2: '',
  option_3: '',
  option_4: '',
  correct_option: 1,
  explanation: '',
  q_type: 'choice',
  correct_text: '',
};

const TOTAL_ROADMAP_ITEMS = 145;

// ── メインコンポーネント ─────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const adminAuth = useRequireAdmin();

  // 認証チェック中
  if (adminAuth === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={36} />
      </div>
    );
  }

  // パスコード未解除 → 合い言葉入力
  if (adminAuth === 'denied') {
    const submit = () => {
      if (checkAdminPasscode(passcode)) {
        unlockAdmin();
        window.location.reload();
      } else {
        setPassError(true);
      }
    };
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Lock className="text-indigo-400" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">管理画面</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">合い言葉を入力してください。</p>
          <input
            type="password"
            value={passcode}
            onChange={e => { setPasscode(e.target.value); setPassError(false); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="合い言葉"
            autoFocus
            className="mt-6 w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-3 text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {passError && <p className="text-red-400 text-sm font-bold mt-3">合い言葉が違います</p>}
          <button onClick={submit} className="mt-4 w-full bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
            入室する
          </button>
          <Link href="/dashboard" className="inline-block mt-4 text-slate-500 text-sm font-bold hover:text-slate-300">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'summary',   label: 'サマリー',   icon: <LayoutDashboard size={16} /> },
    { id: 'students',  label: '生徒管理',   icon: <Users size={16} /> },
    { id: 'questions', label: '問題管理',   icon: <BookOpen size={16} /> },
    { id: 'flashcards', label: 'フラッシュカード', icon: <Layers size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="p-6 text-gray-800">
        <div className="max-w-6xl mx-auto">

          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
          <header className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={36} /> Admin Dashboard
            </h1>
            <p className="text-gray-400 font-medium mt-1">Learning Support 管理者専用コントロールパネル</p>
          </header>

          {/* タブナビ */}
          <div className="flex gap-2 mb-8 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* タブコンテンツ */}
          {activeTab === 'summary'   && <SummaryTab />}
          {activeTab === 'students'  && <StudentsTab />}
          {activeTab === 'questions' && <QuestionsTab />}
          {activeTab === 'flashcards' && <FlashcardsTab />}

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// タブ① サマリー
// ══════════════════════════════════════════════════════════
function SummaryTab() {
  const supabase = createClient();
  const [stats, setStats] = useState({ total: 0, weeklyActive: 0, avgProgress: 0, newThisWeek: 0 });
  const [recent, setRecent] = useState<{ name: string; lastActive: string; progress: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoff = sevenDaysAgo.toISOString().split('T')[0];

      const { data: profiles } = await supabase.from('profiles').select('*');
      if (!profiles) { setLoading(false); return; }

      let weeklyActiveCount = 0;
      let totalProgress = 0;
      let newThisWeek = 0;
      const recentList: typeof recent = [];

      await Promise.all(profiles.map(async (p) => {
        const { data: logs } = await supabase.from('study_logs').select('study_date').eq('user_id', p.id);
        const { count } = await supabase.from('roadmap_progress').select('*', { count: 'exact', head: true }).eq('user_id', p.id).eq('is_completed', true);
        const progress = Math.round(((count || 0) / TOTAL_ROADMAP_ITEMS) * 100);
        totalProgress += progress;

        const hasWeeklyActivity = logs?.some(l => l.study_date >= cutoff);
        if (hasWeeklyActivity) weeklyActiveCount++;

        const lastActive = logs && logs.length > 0
          ? [...logs].sort((a, b) => b.study_date.localeCompare(a.study_date))[0].study_date
          : 'No data';

        if (p.created_at && p.created_at >= sevenDaysAgo.toISOString()) newThisWeek++;

        recentList.push({ name: p.display_name || `Student`, lastActive, progress });
      }));

      recentList.sort((a, b) => b.lastActive.localeCompare(a.lastActive));

      setStats({
        total: profiles.length,
        weeklyActive: weeklyActiveCount,
        avgProgress: profiles.length > 0 ? Math.round(totalProgress / profiles.length) : 0,
        newThisWeek,
      });
      setRecent(recentList.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: '総生徒数',           value: `${stats.total}名`,        icon: <GraduationCap size={22} />, color: 'bg-blue-50 text-blue-600' },
    { label: '今週アクティブ',     value: `${stats.weeklyActive}名`, icon: <Activity size={22} />,      color: 'bg-green-50 text-green-600' },
    { label: '平均進捗率',         value: `${stats.avgProgress}%`,   icon: <TrendingUp size={22} />,    color: 'bg-violet-50 text-violet-600' },
    { label: '今週の新規登録',     value: `${stats.newThisWeek}名`,  icon: <UserCheck size={22} />,     color: 'bg-orange-50 text-orange-600' },
  ];

  if (loading) return <LoadingPlaceholder />;

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>{c.icon}</div>
            <p className="text-3xl font-black text-gray-900">{c.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* 直近アクティブな生徒 */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg font-black text-gray-900 mb-6">直近のアクティブ生徒</h2>
        <div className="space-y-4">
          {recent.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{s.name}</p>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock size={10} /> {s.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
                <span className="text-sm font-black text-indigo-600 w-10 text-right">{s.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// タブ② 生徒管理
// ══════════════════════════════════════════════════════════
function StudentsTab() {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newSubject, setNewSubject] = useState<Subject>('en');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  // 編集・削除
  const [editTarget, setEditTarget] = useState<StudentRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editSubject, setEditSubject] = useState<Subject>('en');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString().split('T')[0];

    const { data: profiles } = await supabase.from('profiles').select('*');
    if (!profiles) { setLoading(false); return; }

    const rows = await Promise.all(profiles.map(async (p) => {
      try {
        const { data: logs } = await supabase.from('study_logs').select('study_time_minutes, study_date').eq('user_id', p.id);
        const { count } = await supabase.from('roadmap_progress').select('*', { count: 'exact', head: true }).eq('user_id', p.id).eq('is_completed', true);
        const totalMinutes = logs?.reduce((a, l) => a + (l.study_time_minutes || 0), 0) || 0;
        const weeklyMinutes = logs?.filter(l => l.study_date >= cutoff).reduce((a, l) => a + (l.study_time_minutes || 0), 0) || 0;
        const lastActive = logs && logs.length > 0 ? [...logs].sort((a, b) => b.study_date.localeCompare(a.study_date))[0].study_date : 'No data';
        return {
          id: p.id,
          name: p.display_name || `Student (${p.id.slice(0, 4)})`,
          student_id: p.student_id || '-',
          subject: p.subject || 'en',
          role: p.role,
          progress: Math.round(((count || 0) / TOTAL_ROADMAP_ITEMS) * 100),
          totalHours: (totalMinutes / 60).toFixed(1),
          weeklyHours: (weeklyMinutes / 60).toFixed(1),
          lastActive,
        };
      } catch { return null; }
    }));

    setStudents(rows.filter(Boolean) as StudentRow[]);
    setLoading(false);
  };

  const addStudent = async () => {
    setAddError('');
    if (!newName.trim()) { setAddError('名前を入力してください'); return; }
    setAddLoading(true);
    const password_hash = newPassword.trim() ? await hashPassword(newPassword.trim()) : null;
    const { error } = await supabase.from('profiles').insert({
      display_name: newName.trim(),
      student_id: newStudentId.trim() || null,
      password_hash,
      subject: newSubject,
      role: 'student',
    });
    if (error) {
      setAddError('登録中にエラーが発生しました');
    } else {
      setNewName('');
      setNewStudentId('');
      setNewPassword('');
      setNewSubject('en');
      fetchStudentData();
    }
    setAddLoading(false);
  };

  const openEdit = (s: StudentRow) => {
    setEditTarget(s);
    setEditName(s.name);
    setEditStudentId(s.student_id === '-' ? '' : s.student_id);
    setEditSubject((s.subject as Subject) || 'en');
    setEditPassword('');
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setEditError('');
    if (!editName.trim()) { setEditError('名前を入力してください'); return; }
    setEditSaving(true);
    const updates: Record<string, unknown> = {
      display_name: editName.trim(),
      student_id: editStudentId.trim() || null,
      subject: editSubject,
    };
    // パスワード欄が入力されたときだけ更新（空ならそのまま）
    if (editPassword.trim()) {
      updates.password_hash = await hashPassword(editPassword.trim());
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', editTarget.id);
    if (error) {
      setEditError('更新中にエラーが発生しました');
    } else {
      setEditTarget(null);
      fetchStudentData();
    }
    setEditSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('profiles').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (!error) {
      setDeleteTarget(null);
      fetchStudentData();
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStatus({ message: '名簿を解析中...', type: null });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      // 列: A:(無視) B:Name C:ID (D無視) E:Start Date
      const rows = lines.map(line => {
        const p = line.split(',');
        return {
          display_name: p[1]?.trim(),
          student_id: p[2]?.trim() || null,
          start_date: p[4]?.trim() || null,
          role: 'student',
        };
      }).filter(s => s.display_name);

      if (rows.length === 0) {
        setUploadStatus({ message: '有効な利用者データが見つかりませんでした。', type: 'error' });
        setIsUploading(false);
        return;
      }
      const { error } = await supabase.from('profiles').insert(rows);
      if (!error) {
        setUploadStatus({ message: `${rows.length}名の一括登録に成功しました！`, type: 'success' });
        fetchStudentData();
      } else {
        setUploadStatus({ message: '登録中にエラーが発生しました。', type: 'error' });
      }
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10">

      {/* ── 利用者登録 ── */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><UserCheck size={22} /></div>
          <div>
            <h3 className="text-lg font-black text-gray-900">利用者を登録</h3>
            <p className="text-xs text-gray-400 font-medium">登録した利用者は入口の一覧から自分を選び、初期パスワードでログインします（パスワードは本人が後から変更可）</p>
          </div>
        </div>

        {/* 追加フォーム */}
        <div className="flex flex-col md:flex-row gap-3 mb-2">
          <input
            type="text"
            placeholder="名前（必須）"
            value={newName}
            onChange={e => { setNewName(e.target.value); setAddError(''); }}
            className="flex-1 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          />
          <input
            type="text"
            placeholder="ID（任意）"
            value={newStudentId}
            onChange={e => setNewStudentId(e.target.value)}
            className="md:w-40 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          />
          <input
            type="text"
            placeholder="初期パスワード（任意）"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="md:w-48 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          />
          <select
            value={newSubject}
            onChange={e => setNewSubject(e.target.value as Subject)}
            title="学習内容"
            className="md:w-36 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          >
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button
            onClick={addStudent}
            disabled={addLoading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {addLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            登録
          </button>
        </div>
        {addError && (
          <p className="flex items-center gap-2 text-red-500 text-sm font-bold mt-2"><AlertCircle size={14} />{addError}</p>
        )}
      </div>

      {/* ── CSV一括登録 ── */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><Upload size={22} /></div>
          <div>
            <h3 className="text-lg font-black text-gray-900">CSV 一括登録</h3>
            <p className="text-xs text-gray-400 font-medium">B:Name, C:ID, E:Start Date（A・D列スキップ）</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] p-8 bg-gray-50/30">
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={36} />
              <p className="font-bold text-gray-600">{uploadStatus.message}</p>
            </div>
          ) : uploadStatus.type === 'success' ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="text-green-500" size={36} />
              <p className="font-bold text-gray-600">{uploadStatus.message}</p>
              <button onClick={() => setUploadStatus({ message: '', type: null })} className="text-sm text-indigo-600 font-bold underline">続けて登録する</button>
            </div>
          ) : (
            <>
              <input type="file" accept=".csv" id="student-csv" className="hidden" onChange={handleCsvUpload} />
              <label htmlFor="student-csv" className="cursor-pointer bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
                <Upload size={18} /> CSVファイルを選択
              </label>
              {uploadStatus.type === 'error' && <p className="mt-4 text-red-500 font-bold text-sm">{uploadStatus.message}</p>}
            </>
          )}
        </div>
      </div>

      {/* ── 生徒一覧 ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">生徒一覧</h2>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">{students.length}名</span>
        </div>
        {loading ? <LoadingPlaceholder /> : (
          <div className="grid grid-cols-1 gap-4">
            {students.map(s => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${s.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                      <Clock size={11} /> {s.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                    <span className="text-sm font-black text-blue-600">{s.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-black text-gray-900">{s.totalHours}h</p>
                  </div>
                  <div className="text-center px-4 border-l border-gray-100">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Weekly</p>
                    <p className="font-black text-blue-600">{s.weeklyHours}h</p>
                  </div>
                  <button onClick={() => openEdit(s)} title="編集" className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => setDeleteTarget(s)} title="削除" className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                  </button>
                  <Link href={`/admin/students/${s.id}`} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 編集モーダル ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-8 pb-4">
              <h2 className="text-xl font-black text-gray-900">利用者を編集</h2>
              <button onClick={() => setEditTarget(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 pt-2 space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">名前</label>
                <input type="text" value={editName} onChange={e => { setEditName(e.target.value); setEditError(''); }}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">ID（任意）</label>
                <input type="text" value={editStudentId} onChange={e => setEditStudentId(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">学習内容</label>
                <select value={editSubject} onChange={e => setEditSubject(e.target.value as Subject)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-400">
                  {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">パスワード再設定（任意）</label>
                <input type="text" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="変更する場合のみ入力"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
                <p className="text-[11px] text-gray-400 font-medium mt-1.5">空欄のままなら現在のパスワードを維持します。</p>
              </div>
              {editError && <p className="flex items-center gap-2 text-red-500 text-sm font-bold"><AlertCircle size={14} />{editError}</p>}
              <button onClick={saveEdit} disabled={editSaving}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50">
                {editSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                変更を保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 削除確認ダイアログ ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={26} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">「{deleteTarget.name}」を削除しますか？</h3>
            <p className="text-sm text-gray-400 font-medium mb-6">この利用者の学習記録・進捗も全て削除されます。この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all">
                キャンセル
              </button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting && <Loader2 size={16} className="animate-spin" />}削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// タブ③ 問題管理
// ══════════════════════════════════════════════════════════
function QuestionsTab() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState<'' | Subject>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBook, setFilterBook] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Question | null>(null);
  const [form, setForm] = useState<Omit<Question, 'id' | 'created_at'>>(EMPTY_QUESTION);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (data) setQuestions(data);
    setLoading(false);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_QUESTION);
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditTarget(q);
    setForm({
      subject: q.subject || 'en', category: q.category, book_name: q.book_name, chapter: q.chapter,
      question_text: q.question_text, option_1: q.option_1, option_2: q.option_2,
      option_3: q.option_3, option_4: q.option_4, correct_option: q.correct_option,
      explanation: q.explanation || '', q_type: q.q_type || 'choice', correct_text: q.correct_text || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editTarget) {
      await supabase.from('questions').update(form).eq('id', editTarget.id);
    } else {
      await supabase.from('questions').insert(form);
    }
    await fetchQuestions();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('questions').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchQuestions();
  };

  const categories = [...new Set(questions.map(q => q.category))];
  const books = [...new Set(questions.map(q => q.book_name))];
  const filtered = questions.filter(q =>
    (!filterSubject || (q.subject || 'en') === filterSubject) &&
    (!filterCategory || q.category === filterCategory) &&
    (!filterBook || q.book_name === filterBook)
  );

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value as '' | Subject)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">全学習内容</option>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">全カテゴリ</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterBook} onChange={e => setFilterBook(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">全教材</option>
            {books.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <span className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm font-bold">{filtered.length}件</span>
        </div>
        <button onClick={openAdd}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
          <Plus size={16} /> 問題を追加
        </button>
      </div>

      {/* テーブル */}
      {loading ? <LoadingPlaceholder /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">カテゴリ</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">教材</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">章</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-widest w-80">問題文</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">正解</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr key={q.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">{q.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 text-xs">{q.book_name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">{q.chapter}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium max-w-xs">
                      <p className="truncate">{q.question_text}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="w-7 h-7 rounded-lg bg-green-100 text-green-700 font-black text-xs flex items-center justify-center">
                        {q.correct_option}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(q)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirm(q.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-300 font-bold py-16">問題が見つかりません</p>
            )}
          </div>
        </div>
      )}

      {/* ── 追加・編集モーダル ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 pb-4">
              <h2 className="text-xl font-black text-gray-900">{editTarget ? '問題を編集' : '問題を追加'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 pt-4 space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">学習内容</label>
                <select
                  value={form.subject || 'en'}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="カテゴリ" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
                <FormField label="教材名" value={form.book_name} onChange={v => setForm(f => ({ ...f, book_name: v }))} />
                <FormField label="章" value={form.chapter} onChange={v => setForm(f => ({ ...f, chapter: v }))} />
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">問題文</label>
                <textarea
                  value={form.question_text}
                  onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([1, 2, 3, 4] as const).map(n => (
                  <FormField
                    key={n}
                    label={`選択肢 ${n}`}
                    value={form[`option_${n}` as keyof typeof form] as string}
                    onChange={v => setForm(f => ({ ...f, [`option_${n}`]: v }))}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">正解番号</label>
                  <select
                    value={form.correct_option}
                    onChange={e => setForm(f => ({ ...f, correct_option: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">タイプ</label>
                  <select
                    value={form.q_type || 'choice'}
                    onChange={e => setForm(f => ({ ...f, q_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="choice">choice</option>
                    <option value="text">text</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">解説（任意）</label>
                <textarea
                  value={form.explanation || ''}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editTarget ? '変更を保存' : '問題を追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 削除確認ダイアログ ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={26} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">この問題を削除しますか？</h3>
            <p className="text-sm text-gray-400 font-medium mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all">
                キャンセル
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 共通パーツ ───────────────────────────────────────────
function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin text-indigo-400" size={32} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// フラッシュカード管理（デッキ＝教材ごとにカードを追加）
// ══════════════════════════════════════════════════════════
interface Deck {
  id: string;
  subject: string;
  category: string | null;
  deck_name: string;
  description: string | null;
  count: number;
}
interface FCard {
  id: string;
  front: string;
  back: string;
  reading: string | null;
  example: string | null;
}

function FlashcardsTab() {
  const supabase = createClient();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Deck | null>(null);

  // デッキ作成フォーム
  const [dSubject, setDSubject] = useState<Subject>('en');
  const [dCategory, setDCategory] = useState('単語');
  const [dName, setDName] = useState('');
  const [dDesc, setDDesc] = useState('');
  const [dError, setDError] = useState('');

  useEffect(() => { fetchDecks(); }, []);

  const fetchDecks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('flashcard_decks')
      .select('id, subject, category, deck_name, description, flashcards(count)')
      .order('subject', { ascending: true })
      .order('created_at', { ascending: true });
    setDecks((data || []).map((d: any) => ({
      id: d.id, subject: d.subject, category: d.category, deck_name: d.deck_name,
      description: d.description, count: d.flashcards?.[0]?.count ?? 0,
    })));
    setLoading(false);
  };

  const addDeck = async () => {
    setDError('');
    if (!dName.trim()) { setDError('教材名（デッキ名）を入力してください'); return; }
    const { error } = await supabase.from('flashcard_decks').insert({
      subject: dSubject, category: dCategory.trim() || null, deck_name: dName.trim(), description: dDesc.trim() || null,
    });
    if (error) { setDError('作成に失敗しました'); return; }
    setDName(''); setDDesc('');
    fetchDecks();
  };

  const deleteDeck = async (id: string) => {
    if (!confirm('このデッキとカードを全て削除しますか？')) return;
    await supabase.from('flashcard_decks').delete().eq('id', id);
    if (selected?.id === id) setSelected(null);
    fetchDecks();
  };

  if (selected) {
    return <DeckCardsEditor deck={selected} onBack={() => { setSelected(null); fetchDecks(); }} />;
  }

  return (
    <div className="space-y-10">
      {/* デッキ作成 */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Layers size={22} /></div>
          <div>
            <h3 className="text-lg font-black text-gray-900">単語帳（デッキ）を作成</h3>
            <p className="text-xs text-gray-400 font-medium">教材ごとにデッキを作り、カードを足していきます。学習者は自分の学習内容のデッキだけ見られます。</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-2">
          <select value={dSubject} onChange={e => setDSubject(e.target.value as Subject)}
            className="md:w-36 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-400">
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input type="text" placeholder="カテゴリ（例: 単語/カタカナ/漢字）" value={dCategory}
            onChange={e => setDCategory(e.target.value)}
            className="md:w-56 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="text" placeholder="教材名（必須・例: カタカナ）" value={dName}
            onChange={e => { setDName(e.target.value); setDError(''); }} onKeyDown={e => e.key === 'Enter' && addDeck()}
            className="flex-1 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
          <button onClick={addDeck}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
            <Plus size={16} /> 作成
          </button>
        </div>
        <input type="text" placeholder="説明（任意）" value={dDesc} onChange={e => setDDesc(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 mt-2" />
        {dError && <p className="flex items-center gap-2 text-red-500 text-sm font-bold mt-2"><AlertCircle size={14} />{dError}</p>}
      </div>

      {/* デッキ一覧 */}
      {loading ? <LoadingPlaceholder /> : decks.length === 0 ? (
        <p className="text-center text-gray-300 font-bold py-10">まだデッキがありません</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map(d => (
            <div key={d.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <button onClick={() => setSelected(d)} className="text-left min-w-0 flex-1 group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-black">{SUBJECT_LABEL[d.subject as Subject] || d.subject}</span>
                  {d.category && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-black">{d.category}</span>}
                </div>
                <p className="font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{d.deck_name}</p>
                <p className="text-xs text-gray-400 font-bold mt-0.5">{d.count} 枚 ・ クリックでカード編集</p>
              </button>
              <button onClick={() => deleteDeck(d.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// デッキ内カードの編集（追加・削除・CSV一括）
function DeckCardsEditor({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const supabase = createClient();
  const [cards, setCards] = useState<FCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [reading, setReading] = useState('');
  const [example, setExample] = useState('');
  const [bulk, setBulk] = useState('');
  const [bulkMsg, setBulkMsg] = useState('');

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    setLoading(true);
    const { data } = await supabase.from('flashcards').select('id, front, back, reading, example')
      .eq('deck_id', deck.id).order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    setCards((data as FCard[]) || []);
    setLoading(false);
  };

  const addCard = async () => {
    if (!front.trim() || !back.trim()) return;
    await supabase.from('flashcards').insert({
      deck_id: deck.id, front: front.trim(), back: back.trim(),
      reading: reading.trim() || null, example: example.trim() || null, sort_order: cards.length,
    });
    setFront(''); setBack(''); setReading(''); setExample('');
    fetchCards();
  };

  const deleteCard = async (id: string) => {
    await supabase.from('flashcards').delete().eq('id', id);
    fetchCards();
  };

  // 一括追加: 1行 = front,back,reading,example（カンマ または タブ区切り。front/backのみ必須）
  const importBulk = async () => {
    setBulkMsg('');
    const lines = bulk.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rows = lines.map((line, i) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      const [f, b, r, e] = parts.map(p => p.trim());
      return { deck_id: deck.id, front: f, back: b || '', reading: r || null, example: e || null, sort_order: cards.length + i };
    }).filter(r => r.front && r.back);
    if (rows.length === 0) { setBulkMsg('有効な行がありません（front,back が必要）'); return; }
    const { error } = await supabase.from('flashcards').insert(rows);
    if (error) { setBulkMsg('取り込みに失敗しました'); return; }
    setBulk(''); setBulkMsg(`${rows.length}枚を追加しました`);
    fetchCards();
  };

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-700 transition-all">
        <ArrowLeft size={16} /> デッキ一覧へ
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-black">{SUBJECT_LABEL[deck.subject as Subject] || deck.subject}</span>
          {deck.category && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-black">{deck.category}</span>}
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-6">{deck.deck_name}</h3>

        {/* 1枚追加 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input type="text" placeholder="表（必須）" value={front} onChange={e => setFront(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="text" placeholder="裏（必須）" value={back} onChange={e => setBack(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="text" placeholder="読み（任意）" value={reading} onChange={e => setReading(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="text" placeholder="例文（任意）" value={example} onChange={e => setExample(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <button onClick={addCard}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <Plus size={16} /> カードを追加
        </button>

        {/* 一括追加 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">一括追加（1行 = 表,裏,読み,例文 / カンマ or タブ区切り）</label>
          <textarea value={bulk} onChange={e => setBulk(e.target.value)} rows={4}
            placeholder={'ア,a\nイ,i\nねこ,cat,ねこ,かわいいねこ'}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 font-mono" />
          <div className="flex items-center gap-3 mt-2">
            <button onClick={importBulk}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all">一括追加</button>
            {bulkMsg && <span className="text-sm font-bold text-gray-500">{bulkMsg}</span>}
          </div>
        </div>
      </div>

      {/* カード一覧 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold text-gray-700">カード一覧</h4>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-xl text-sm font-bold">{cards.length}枚</span>
        </div>
        {loading ? <LoadingPlaceholder /> : cards.length === 0 ? (
          <p className="text-center text-gray-300 font-bold py-12">まだカードがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="text-left px-6 py-3">表</th>
                  <th className="text-left px-6 py-3">裏</th>
                  <th className="text-left px-6 py-3">読み</th>
                  <th className="text-left px-6 py-3">例文</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-50 ${i % 2 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-6 py-3 font-bold text-gray-900">{c.front}</td>
                    <td className="px-6 py-3 text-gray-700">{c.back}</td>
                    <td className="px-6 py-3 text-gray-400">{c.reading || '-'}</td>
                    <td className="px-6 py-3 text-gray-400 italic max-w-xs truncate">{c.example || '-'}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => deleteCard(c.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
