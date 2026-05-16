'use client';

import * as React from 'react';
import { AdminGuard } from '@/shared/components/guards/AdminGuard';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Settings,
  LogOut, Menu, X, Zap, Bell, ChevronRight,
  User, Wallet, History, Trophy
} from 'lucide-react';

const ADMIN_MENU = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/stories', icon: BookOpen, label: 'Quản Lý Truyện' },
  { href: '/admin/authors', icon: User, label: 'Tác Giả' },
  { href: '/admin/categories', icon: Zap, label: 'Thể Loại' },
  { href: '/admin/users', icon: Users, label: 'Thành Viên' },
  { href: '/admin/wallet', icon: Wallet, label: 'Kinh Tế' },
  { href: '/admin/quests', icon: Trophy, label: 'Nhiệm Vụ' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Thống Kê' },
  { href: '/admin/settings', icon: Settings, label: 'Cấu Hình' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const currentPage = ADMIN_MENU.find(m => m.href === pathname) || ADMIN_MENU.find(m => pathname?.startsWith(m.href) && m.href !== '/admin');

  return (
    <AdminGuard>
      <div 
        className="flex h-screen w-full bg-[#0a0a0a] text-neutral-200 font-sans overflow-hidden"
        style={{ 
          '--sidebar-width': sidebarOpen ? '256px' : '80px',
        } as React.CSSProperties}
      >

        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:flex flex-col bg-[#121212] border-r border-white/10 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
            <Link href="/admin" className={cn("flex items-center gap-2 overflow-hidden", !sidebarOpen && "justify-center w-full")}>
              <div className="h-8 w-8 rounded-lg bg-crimson flex items-center justify-center shrink-0 shadow-lg shadow-crimson/20">
                <Zap className="h-4 w-4 text-white fill-current" />
              </div>
              {sidebarOpen && <span className="font-fantasy font-bold text-lg text-white truncate">StoryVerse CMS</span>}
            </Link>
          </div>

          <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
            {ADMIN_MENU.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 h-11 rounded-xl font-bold text-sm transition-all group",
                    active
                      ? "bg-primary/10 text-primary-light border border-primary/20 shadow-inner"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10 shrink-0">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="h-10 w-10 rounded-lg bg-crimson/20 border border-crimson/30 flex items-center justify-center text-crimson-light font-black shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.profile?.displayName || 'Admin'}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full h-11 flex items-center justify-center rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Đăng xuất">
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Topbar */}
          <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
                <span className="text-neutral-500">CMS</span>
                <ChevronRight className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-200">{currentPage?.label || 'Bảng Điều Khiển'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <Link href="/?mode=user" className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/10 transition-all">
                Về Trang Người Dùng
              </Link>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-hidden p-4 lg:p-8 lg:pb-0 flex flex-col">
            {children}
          </main>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-[#121212] border-r border-white/10 shadow-2xl flex flex-col animate-slide-right">
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <span className="font-fantasy font-bold text-lg text-white">StoryVerse CMS</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
                {ADMIN_MENU.map((item) => {
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 h-12 rounded-xl font-bold text-sm transition-all",
                        active ? "bg-primary/10 text-primary-light border border-primary/20" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
