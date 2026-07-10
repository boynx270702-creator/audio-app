'use client';

import * as React from 'react';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useTranslation } from '@/shared/stores/useTranslation';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useSettingsStore } from '@/shared/stores/useSettingsStore';
import { useTheme } from 'next-themes';
import {
  User, Shield, Palette, LogOut, Bell, Globe,
  ChevronRight, Camera, Monitor, Moon, Sun, Languages,
  Zap, ArrowLeft, Type, AlignLeft, Headphones, MessageSquare, Eye,
  Music2
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';

const THEMES = [
  { id: 'dark', bg: '#080808', text: '#f1f0ff' },
  { id: 'sepia', bg: '#f5ede0', text: '#3d2b1f' },
  { id: 'gray', bg: '#2a2a2a', text: '#e0e0e0' },
  { id: 'default', bg: '#0d0d0d', text: '#f5f5f5' },
]
type Tab = 'profile' | 'security' | 'appearance' | 'audio';

export default function SettingsPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const { addToast } = useToastStore();
  const { theme, setTheme } = useTheme();

  const settings = useSettingsStore();

  const [activeTab, setActiveTab] = React.useState<Tab>('profile');
  const [isSaving, setIsSaving] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Monitor}
        title={t.common.login}
        description="Vui lòng đăng nhập để quản lý cài đặt tài khoản và bảo mật của bạn."
        action={
          <Link href="/auth/login" className="px-8 py-3 rounded-md bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20">
            Đăng Nhập Ngay
          </Link>
        }
      />
    );
  }

  const navItems = [
    { id: 'profile', label: t.settings.profile, icon: User },
    { id: 'security', label: t.settings.security, icon: Shield },
    { id: 'appearance', label: t.settings.appearance, icon: Zap },
    { id: 'audio', label: 'Âm thanh', icon: Music2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-page-in">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-8">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors">
          <ArrowLeft className="h-3 w-3" /> {t.common.back}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-neutral-100">{t.settings.title}</h1>
            <p className="text-sm text-neutral-500 font-medium">{t.settings.sub}</p>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> {t.common.logout}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-1">
          {navItems.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all",
                activeTab === t.id
                  ? "bg-white/[0.06] text-white border-r-2 border-primary"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
              )}
            >
              <t.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{t.label}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 min-w-0 p-6 md:p-8 space-y-10">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-page-in">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-md bg-neutral-900 border border-white/[0.1] flex items-center justify-center overflow-hidden">
                    {user?.profile?.avatarUrl ? (
                      <img src={user.profile.avatarUrl} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-neutral-700" />
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-md shadow-xl hover:scale-110 transition-transform">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 ml-1">{t.settings.displayName}</label>
                    <input
                      defaultValue={user?.profile?.displayName || ''}
                      className="h-10 w-full rounded-md border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-medium text-neutral-200 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 ml-1">Email</label>
                    <input
                      disabled
                      defaultValue={user?.email || ''}
                      className="h-10 w-full rounded-md border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-medium text-neutral-500 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 ml-1">{t.settings.bio}</label>
                    <textarea
                      defaultValue={(user?.profile as any)?.bio || ''}
                      placeholder={(t.settings as any).bioPlaceholder}
                      className="w-full h-24 rounded-md border border-white/[0.1] bg-white/[0.04] p-4 text-sm font-medium text-neutral-200 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-page-in">
              <div className="rounded-md border border-white/[0.06] bg-[#101010] p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 ml-1">Địa chỉ Email</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      disabled
                      value={user?.email || ''} 
                      className="h-10 flex-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-4 text-sm font-medium text-neutral-500 cursor-not-allowed"
                    />
                    <button className="h-10 px-6 rounded-md border border-white/[0.1] text-xs font-bold text-neutral-300 hover:bg-white/[0.05] transition-colors">
                      Xác thực Email
                    </button>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/[0.06]">
                  <button className="h-10 px-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-bold hover:bg-white/[0.08] transition-colors">
                    {t.settings.changePassword}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-page-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">{t.settings.theme.title}</h3>
                  <div className="grid grid-cols-2 gap-3 p-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    {[
                      { id: 'dark', label: 'Tối', icon: Moon },
                      { id: 'light', label: 'Sáng', icon: Sun }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[11px] font-bold transition-all",
                          theme === mode.id ? "bg-primary text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300"
                        )}
                      >
                        <mode.icon className="h-3 w-3" />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">{t.settings.language}</h3>
                  <div className="grid grid-cols-2 gap-3 p-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    {[
                      { id: 'vi', label: 'Tiếng Việt' },
                      { id: 'en', label: 'English' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id as any)}
                        className={cn(
                          "flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all",
                          language === lang.id ? "bg-primary text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">{t.settings.readerSettings}</h3>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
                    <Eye className="h-3 w-3 text-primary-light" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Xem trước trực tiếp</span>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div 
                  className="rounded-md border border-white/[0.06] p-8 transition-all duration-300 min-h-[140px] shadow-inner"
                  style={{ 
                    backgroundColor: THEMES.find(t => t.id === settings.readerTheme)?.bg || '#0d0d0d',
                    color: THEMES.find(t => t.id === settings.readerTheme)?.text || '#f5f5f5'
                  }}
                >
                  <p 
                    style={{ 
                      fontSize: `${settings.fontSize}px`, 
                      lineHeight: settings.lineHeight,
                      textAlign: 'justify'
                    }}
                    className="font-serif italic opacity-90"
                  >
                    "Hành trình vạn dặm bắt đầu từ một bước chân. Trong cõi hồng trần cuồn cuộn, kẻ mạnh nghịch thiên cải mệnh, kẻ yếu thuận theo tự nhiên..."
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                          <Type className="h-3.5 w-3.5" /> Cỡ chữ
                        </div>
                        <span className="text-xs font-bold text-primary-light">{settings.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="14"
                        max="32"
                        value={settings.fontSize}
                        onChange={(e) => settings.setFontSize(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                          <AlignLeft className="h-3.5 w-3.5" /> Dãn dòng
                        </div>
                        <span className="text-xs font-bold text-primary-light">{settings.lineHeight}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.2"
                        max="2.5"
                        step="0.1"
                        value={settings.lineHeight}
                        onChange={(e) => settings.setLineHeight(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                      <Monitor className="h-3.5 w-3.5" /> Màu nền đọc
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: 'dark', bg: 'bg-[#101010]', border: 'border-white/10' },
                        { id: 'sepia', bg: 'bg-[#f4ecd8]', border: 'border-[#e4dcce]' },
                        { id: 'light', bg: 'bg-white', border: 'border-neutral-200' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => settings.setReaderTheme(t.id as any)}
                          className={cn(
                            "h-10 w-10 rounded-full border-2 transition-all",
                            t.bg, t.border,
                            settings.readerTheme === t.id ? "ring-2 ring-primary ring-offset-2 ring-offset-[#101010]" : "scale-90 opacity-60 hover:scale-100 hover:opacity-100"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-8 animate-page-in">
              <div className="max-w-md space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Giọng Đọc Mặc Định</h3>
                  <div className="grid grid-cols-1 gap-2 p-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    {[
                      { id: 'male', label: 'Giọng Nam (Bắc)' },
                      { id: 'female', label: 'Giọng Nữ (Nam)' }
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => settings.setVoice(v.id as any)}
                        className={cn(
                          "w-full py-2.5 rounded-md text-xs font-bold transition-all",
                          settings.voice === v.id ? "bg-primary text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/[0.06] flex justify-end">
            <button
              onClick={() => {
                setIsSaving(true);
                setTimeout(() => {
                  setIsSaving(false);
                  addToast('Đã lưu thay đổi cấu hình thành công!', 'success');
                }, 1000);
              }}
              className="w-full md:w-auto px-10 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {isSaving ? 'Đang lưu...' : t.settings.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
