'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, ArrowRight, Zap, BookOpen, Headphones, Trophy, Star
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

type Mode = 'login' | 'register';

const PERKS = [
  { icon: BookOpen,   text: '10,000+ truyện tu tiên miễn phí' },
  { icon: Headphones, text: 'Nghe audio giọng đọc AI cao cấp' },
  { icon: Trophy,     text: 'Hệ thống nhiệm vụ & tích điểm' },
  { icon: Star,       text: 'Nhận 1,000 Linh Thạch khi đăng ký' },
];

export default function AuthLoginPage() {
  const router = useRouter();
  const { login, register, isLoading } = useAuthStore();
  const [mode, setMode] = React.useState<Mode>('login');
  const [showPwd, setShowPwd] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ email: '', password: '', displayName: '' });

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register({ email: form.email, password: form.password, displayName: form.displayName });
      
      const state = useAuthStore.getState();
      if (state.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? (mode === 'login' ? 'Email hoặc mật khẩu không đúng.' : 'Đăng ký thất bại.'));
    }
  };

  const inputCls = cn(
    'w-full h-10 rounded-md border border-white/[0.1] bg-white/[0.04]',
    'px-3.5 text-sm text-neutral-100 placeholder:text-neutral-600',
    'outline-none transition-all',
    'focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20'
  );

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#080808]">

      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-[#0d0d0d] border-r border-white/[0.06]">
        {/* Subtle glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 fill-current text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white tracking-tight leading-none">StoryVerse</p>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest mt-0.5">Tu Tiên Chi Đạo</p>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                Khai mở<br />
                <span className="text-primary">Tiên Lộ</span><br />
                vấn đỉnh trường sinh.
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Hàng nghìn truyện tu tiên, nghe audio AI, tích điểm và nhiệm vụ — tất cả trong một nền tảng.
              </p>
            </div>

            <div className="space-y-4">
              {PERKS.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-neutral-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-700 italic">
            "Thiên đạo vô tình, ta tự lập tự cường..."
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="flex flex-col items-center justify-center px-6 py-16 bg-[#080808]">
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 fill-current text-white" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">StoryVerse</span>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 rounded-lg bg-white/[0.04] border border-white/[0.07]">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={cn(
                  'flex-1 py-2 rounded-md text-sm font-semibold transition-all',
                  mode === m
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                )}
              >
                {m === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl font-bold text-neutral-100 tracking-tight">
              {mode === 'login' ? 'Chào trở lại' : 'Tạo tài khoản'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {mode === 'login'
                ? 'Tiếp tục hành trình tu luyện của bạn.'
                : 'Miễn phí · Nhận ngay 1,000 Linh Thạch.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Đạo Hiệu</label>
                <input name="displayName" value={form.displayName} onChange={set} placeholder="Tên hiển thị..." required className={inputCls} />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">Email</label>
              <input name="email" type="email" value={form.email} onChange={set} placeholder="email@example.com" required className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">Mật Khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set}
                  placeholder="••••••••"
                  required
                  className={cn(inputCls, 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full h-10 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-semibold',
                'flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20'
              )}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản Miễn Phí'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Register perk */}
          {mode === 'register' && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-500">
                Đăng ký thành công sẽ nhận <span className="text-amber-400 font-semibold">1,000 Linh Thạch</span> miễn phí!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-700">
            <Link href="/" className="hover:text-neutral-500 transition-colors">← Trang chủ</Link>
            <div className="flex gap-3">
              <span className="cursor-pointer hover:text-neutral-500 transition-colors">Điều khoản</span>
              <span className="cursor-pointer hover:text-neutral-500 transition-colors">Bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
