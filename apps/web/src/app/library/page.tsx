'use client';

import * as React from 'react';
import { BookMarked, History, BookOpen, Trash2, ChevronRight, Search, LayoutGrid, List } from 'lucide-react';
import { readingApi } from '@/shared/services/api.service';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useTranslation } from '@/shared/stores/useTranslation';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { Skeleton } from '@/shared/components/ui/atoms/Skeleton';

type Tab = 'history' | 'bookmarks';

export default function LibraryPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<Tab>('history');
  const [items, setItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      setIsLoading(true);
      try {
        if (activeTab === 'history') {
          const res = await readingApi.getHistory();
          setItems(res || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
    load();
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={BookMarked}
        title={t.library.title}
        description="Đăng nhập để xem lịch sử đọc truyện và danh sách yêu thích của bạn."
        action={
          <Link href="/auth/login" className="px-8 py-3 rounded-lg bg-purple-600 text-white font-bold text-sm shadow-xl shadow-purple-500/20 transition-all active:scale-95">
            Đăng Nhập
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-page-in">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/[0.06] pb-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-neutral-100">{t.library.title}</h1>
          <p className="text-sm text-neutral-500 font-medium">{t.library.sub}</p>
        </div>
        
        <div className="flex p-1 rounded-lg bg-white/[0.04] border border-white/[0.07]">
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-2 rounded-md px-6 py-2 text-xs font-bold transition-all",
              activeTab === 'history' ? "bg-purple-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <History className="h-3.5 w-3.5" /> {t.common.history}
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={cn(
              "flex items-center gap-2 rounded-md px-6 py-2 text-xs font-bold transition-all",
              activeTab === 'bookmarks' ? "bg-purple-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <BookMarked className="h-3.5 w-3.5" /> {t.common.bookmarks}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
             {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState 
            title={activeTab === 'history' ? "Lịch sử trống" : "Danh sách trống"}
            description={activeTab === 'history' ? "Bạn chưa đọc truyện nào. Bắt đầu hành trình ngay thôi!" : "Lưu truyện bạn yêu thích để dễ dàng theo dõi sau này."}
            icon={BookOpen}
            action={
              <Link href="/explore" className="px-6 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-bold text-neutral-300 hover:bg-white/[0.1] transition-all">
                {t.common.explore}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
             {items.map((item) => (
                <LibraryItem key={item.id} item={item} />
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryItem({ item }: { item: any }) {
  const { t } = useTranslation();
  return (
    <div className="group flex items-center gap-6 rounded-lg border border-white/[0.06] bg-[#101010] p-4 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.02]">
      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-900 shadow-xl">
        <img src={item.story.coverImage} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.story.title} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
        <div>
          <Link href={`/stories/${item.story.slug}`}>
            <h3 className="text-sm font-bold text-neutral-100 hover:text-primary-light transition-colors truncate leading-tight">{item.story.title}</h3>
          </Link>
          <div className="flex items-center gap-2.5 mt-2">
            <span className="text-[10px] font-black text-primary-light bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">Chương {item.chapter.chapterNumber}</span>
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{Math.floor(item.progressPct)}% Đã Đọc</span>
          </div>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/[0.04] rounded-full mt-3 overflow-hidden">
             <div className="h-full bg-primary rounded-full" style={{ width: `${item.progressPct}%` }} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <Link 
            href={`/read/${item.story.slug}/${item.chapter.chapterNumber}`}
            className="flex-1 flex items-center justify-center h-8 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
          >
            {t.library.resume}
          </Link>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
