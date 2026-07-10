'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Menu, Zap, Gem, User, Settings, 
  LogOut, Globe, Moon, Sun, X, CheckCircle2, Shield,
  Trophy, MessageSquare, AlertCircle, Clock
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useTranslation } from '@/shared/stores/useTranslation';
import { useTheme } from 'next-themes';
import { useNotificationStore } from '@/shared/stores/useNotificationStore';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import { Portal } from '@/shared/components/ui/atoms/Portal';

interface TopBarProps {
  className?: string;
  onMenuClick?: () => void;
}

export function TopBar({ className, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  // Notifications
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [search, setSearch] = React.useState('');
  const [mobileSearch, setMobileSearch] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifMenu, setShowNotifMenu] = React.useState(false);
  
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notifMenuRef = React.useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/explore?q=${encodeURIComponent(search.trim())}`);
    }
    if (e.key === 'Escape') setMobileSearch(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b px-4 md:px-6',
        'bg-[#080808]/90 backdrop-blur-xl border-white/[0.06]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-neutral-400 hover:bg-white/5 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Search Desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 h-9 w-64 lg:w-80 rounded-md bg-white/[0.04] border border-white/[0.08] focus-within:border-primary/50 focus-within:bg-white/[0.06] transition-all">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder={t.common.search}
            className="flex-1 bg-transparent text-xs font-medium text-neutral-200 outline-none placeholder:text-neutral-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearch(true)}
          className="md:hidden p-2 rounded-md text-neutral-400 hover:bg-white/5"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className={cn(
              "p-2 rounded-md transition-all",
              showNotifMenu ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#080808]" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border border-white/[0.1] bg-[#181818] shadow-2xl overflow-hidden animate-scale-in origin-top-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-100">Thông báo</h4>
                <div className="flex gap-2">
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary-light hover:text-white">Đọc hết</button>
                  <button onClick={clearAll} className="text-[10px] font-bold text-neutral-600 hover:text-neutral-400">Xóa</button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        "flex gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 cursor-pointer transition-colors hover:bg-white/[0.02]",
                        !n.isRead && "bg-primary/[0.03]"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center shrink-0 border",
                        n.type === 'quest' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        n.type === 'reward' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                        "bg-primary/10 border-primary/20 text-primary-light"
                      )}>
                        {n.type === 'quest' ? <Trophy className="h-4 w-4" /> : 
                         n.type === 'reward' ? <Gem className="h-4 w-4" /> : 
                         <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-neutral-200 truncate">{n.title}</p>
                        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-neutral-700 font-bold uppercase tracking-tighter pt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <Bell className="h-8 w-8 mx-auto text-neutral-800" />
                    <p className="text-xs font-bold text-neutral-600">Không có thông báo mới</p>
                  </div>
                )}
              </div>
              
              <Link href="/notifications" className="block py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-300 border-t border-white/[0.06] bg-white/[0.01]">
                Xem tất cả
              </Link>
            </div>
          )}
        </div>

        {/* User Section */}
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-primary/50 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border border-white/10 text-xs font-black text-white overflow-hidden">
                {user?.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} className="h-full w-full object-cover" />
                ) : (
                  user?.profile?.displayName?.[0] || 'U'
                )}
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-white/[0.1] bg-[#181818] shadow-2xl overflow-hidden animate-scale-in origin-top-right">
                <div className="p-4 border-b border-white/[0.06]">
                  <p className="text-xs font-black text-neutral-100 truncate">{user?.profile?.displayName || 'Đạo hữu'}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                </div>
                
                <div className="p-1.5 space-y-0.5">
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all">
                      <Shield className="h-4 w-4" /> Vào Trang Quản Trị
                    </Link>
                  )}
                  <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold text-neutral-400 hover:bg-white/5 hover:text-white transition-all">
                    <User className="h-4 w-4" /> {t.settings.profile}
                  </Link>
                  <Link href="/settings?tab=appearance" className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold text-neutral-400 hover:bg-white/5 hover:text-white transition-all">
                    <Settings className="h-4 w-4" /> {t.settings.appearance}
                  </Link>
                </div>

                <div className="p-1.5 border-t border-white/[0.06] space-y-0.5">
                  <div className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                    <div className="flex items-center gap-2"><Globe className="h-3 w-3" /> Ngôn ngữ</div>
                    <div className="flex gap-2">
                      <button onClick={() => setLanguage('vi')} className={cn(language === 'vi' ? "text-primary-light" : "hover:text-neutral-400")}>VI</button>
                      <button onClick={() => setLanguage('en')} className={cn(language === 'en' ? "text-primary-light" : "hover:text-neutral-400")}>EN</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />} 
                      Giao diện
                    </div>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hover:text-neutral-400">
                      {theme === 'dark' ? 'Sáng' : 'Tối'}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/5 transition-all border-t border-white/[0.06]"
                >
                  <LogOut className="h-4 w-4" /> {t.common.logout}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              href="/auth/login" 
              className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-all"
            >
              {t.common.login}
            </Link>
            <Link 
              href="/auth/login" 
              className="px-5 py-2 rounded-md bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Bắt đầu
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearch && (
        <Portal>
          <div className="fixed inset-0 z-[100] bg-[#080808] p-4 animate-page-in">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-md bg-white/[0.04] border border-white/[0.08]">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder={t.common.search}
                  className="flex-1 bg-transparent text-sm font-medium text-neutral-200 outline-none"
                />
              </div>
              <button
                onClick={() => setMobileSearch(false)}
                className="p-2 text-neutral-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </Portal>
      )}
    </header>
  );
}
