'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AudioEngine } from '@/shared/components/AudioEngine';
import { FloatingAudioPlayer } from '@/shared/components/ui/organisms/FloatingAudioPlayer';
import { ToastContainer } from '@/shared/components/ui/organisms/ToastContainer';
import { cn } from '@/shared/utils/cn';
import { X, Home, Compass, Library, Trophy, Wallet } from 'lucide-react';
import Link from 'next/link';

const MOBILE_NAV = [
  { label: 'Home',    href: '/',        icon: Home    },
  { label: 'Khám Phá', href: '/explore', icon: Compass },
  { label: 'Thư Viện', href: '/library', icon: Library },
  { label: 'Quest',   href: '/quests',  icon: Trophy  },
  { label: 'Ví',      href: '/wallet',  icon: Wallet  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const isAuth   = pathname?.startsWith('/auth');
  const isReader = pathname?.startsWith('/read');
  const isAdmin  = pathname?.startsWith('/admin');

  React.useEffect(() => setDrawerOpen(false), [pathname]);

  if (isAuth) {
    return (
      <div className="min-h-screen bg-[#080808] font-sans">
        {children}
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-void-900 font-sans text-foreground">
        {children}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080808] font-sans">
      <AudioEngine />

      {/* Sidebar — desktop */}
      <Sidebar className="hidden lg:flex w-[220px] shrink-0" />

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#101010] border-r border-white/[0.06] lg:hidden',
          'transition-transform duration-250 ease-out shadow-2xl',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
        <Sidebar className="flex h-full w-full border-0" />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {!isReader && (
          <TopBar onMenuClick={() => setDrawerOpen(true)} />
        )}

        <main className="flex-1 overflow-y-auto">
          <div
            key={pathname}
            className={cn(
              'w-full min-h-full animate-page-in',
              isReader ? '' : 'px-4 py-6 md:px-8 md:py-8 pb-28'
            )}
          >
            {children}
          </div>
        </main>

        <FloatingAudioPlayer />
        <ToastContainer />

        {/* Mobile bottom nav */}
        {!isReader && (
          <nav className="lg:hidden shrink-0 flex h-14 items-center justify-around border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl">
            {MOBILE_NAV.map(item => {
              const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors',
                    active ? 'text-primary-light' : 'text-neutral-600 hover:text-neutral-300'
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
