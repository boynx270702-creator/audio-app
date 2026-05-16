'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, Library, Trophy, Wallet, Clock,
  Star, Settings, Shield, BookOpen, Users, Zap, BarChart3
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/shared/stores/useAuthStore';

const NAV_MAIN = [
  { label: 'Trang Chủ',  href: '/',        icon: Home },
  { label: 'Khám Phá',   href: '/explore', icon: Compass },
  { label: 'Thư Viện',   href: '/library', icon: Library },
];

const NAV_USER = [
  { label: 'Tu Luyện Quán', href: '/quests',           icon: Trophy },
  { label: 'Linh Khố',      href: '/wallet',           icon: Wallet },
  { label: 'Lịch Sử',       href: '/library/history',  icon: Clock  },
  { label: 'Đánh Dấu',      href: '/library/bookmarks',icon: Star   },
];

// Removed NAV_ADMIN as per the new separate SPA architecture requirement

function NavItem({
  item,
  collapsed,
  variant = 'default',
}: {
  item: { label: string; href: string; icon: React.ElementType };
  collapsed: boolean;
  variant?: 'default' | 'admin';
}) {
  const pathname = usePathname();
  const isActive =
    item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

  const activeStyle =
    variant === 'admin'
      ? 'bg-red-500/10 text-red-400 border-r-2 border-red-500'
      : 'bg-primary/10 text-primary-light border-r-2 border-primary';

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150',
        isActive
          ? activeStyle
          : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // wide on lg+, icon-only on smaller via parent controlling width
  const collapsed = false;

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-[#101010]',
        'border-white/[0.06]',
        className
      )}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-4 border-b border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0">
          <Zap className="h-4 w-4 fill-current text-white" />
        </div>
        <div className="hidden lg:block min-w-0">
          <p className="text-sm font-800 font-extrabold text-white leading-none tracking-tight">StoryVerse</p>
          <p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-widest">Tu Tiên Chi Đạo</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        <div className="space-y-0.5">
          <p className="hidden lg:block px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
            Điều Hướng
          </p>
          {NAV_MAIN.map(item => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="space-y-0.5">
          <p className="hidden lg:block px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
            Tu Luyện
          </p>
          {NAV_USER.map(item => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Admin section removed, access via TopBar avatar dropdown instead */}
      </nav>

      {/* User profile strip */}
      {user && (
        <div className="shrink-0 px-3 py-3 border-t border-white/[0.06]">
          <Link
            href="/settings"
            className="hidden lg:flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="h-8 w-8 rounded-full bg-primary/80 flex items-center justify-center shrink-0 text-white text-xs font-bold">
              {user?.profile?.displayName?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-200 truncate leading-none">
                {user.profile?.displayName ?? 'Tu Sĩ'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{user.email}</p>
            </div>
            <Settings className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
          </Link>

          {/* Mobile: just settings icon */}
          <div className="flex lg:hidden justify-center">
            <Link href="/settings" className="p-2 rounded-md hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
