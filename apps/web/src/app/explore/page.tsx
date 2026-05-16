'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Star, Heart, Eye, Headphones, BookOpen, Flame, Zap, TrendingUp, Clock } from 'lucide-react';
import { storiesApi } from '@/shared/services/api.service';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { Skeleton } from '@/shared/components/ui/atoms/Skeleton';

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả', icon: '⚡' },
  { id: 'tu-tien', label: 'Tu Tiên', icon: '☯' },
  { id: 'huyen-huyen', label: 'Huyền Huyễn', icon: '🌟' },
  { id: 'kiem-hiep', label: 'Kiếm Hiệp', icon: '⚔️' },
  { id: 'trong-sinh', label: 'Trọng Sinh', icon: '🔄' },
  { id: 'di-the', label: 'Dị Thế', icon: '🌌' },
  { id: 'robot', label: 'Sci-Fi', icon: '🤖' },
  { id: 'romance', label: 'Ngôn Tình', icon: '💕' },
];

const SORT_OPTIONS = [
  { id: 'trending', label: 'Thịnh Hành', icon: <Flame className="h-4 w-4" /> },
  { id: 'new', label: 'Mới Nhất', icon: <Zap className="h-4 w-4" /> },
  { id: 'popular', label: 'Phổ Biến', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'updated', label: 'Cập Nhật', icon: <Clock className="h-4 w-4" /> },
];

function StoryCard({ story }: { story: any }) {
  return (
    <Link href={`/stories/${story.slug}`} className="story-card group block">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={story.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={story.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Audio badge */}
        {story.hasAudio && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-green-400">
              <Headphones className="h-3 w-3" /> Audio
            </div>
          </div>
        )}

        {/* Hover info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-3 text-[10px] font-bold text-white/70">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> 24k</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {story.chapters?.length || 0} ch</span>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <h4 className="text-sm font-bold text-neutral-100 line-clamp-2 group-hover:text-white transition-colors leading-tight">
          {story.title}
        </h4>
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500 truncate">{story.author?.name}</p>
          <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 flex-shrink-0">
            <Star className="h-3 w-3 fill-current" /> 4.8
          </div>
        </div>
      </div>
    </Link>
  );
}

function StoryCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] rounded-lg" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/2 opacity-50" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [activeSort, setActiveSort] = React.useState('trending');
  const [searchInput, setSearchInput] = React.useState(query);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await storiesApi.getAll(1, 32);
        let filtered = res.data || [];
        if (searchInput) {
          filtered = filtered.filter((s: any) =>
            s.title.toLowerCase().includes(searchInput.toLowerCase()) ||
            s.author?.name?.toLowerCase().includes(searchInput.toLowerCase())
          );
        }
        setStories(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 400); // Small delay for smoother transition
      }
    }
    load();
  }, [searchInput]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-page-in">

      {/* Page Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-neutral-100">
              Khám Phá <span className="text-gradient-purple">Thế Giới</span>
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              {isLoading ? 'Đang triệu hồi...' : `${stories.length}+ truyện đang chờ đợi bạn`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {SORT_OPTIONS.map(sort => (
              <button
                key={sort.id}
                onClick={() => setActiveSort(sort.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all",
                  activeSort === sort.id
                    ? "bg-primary/10 border-primary/40 text-primary-light"
                    : "bg-white/[0.04] border-white/[0.08] text-neutral-500 hover:text-neutral-300"
                )}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-600 group-focus-within:text-primary-light transition-colors" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm truyện, tác giả..."
            className={cn(
              "w-full h-14 pl-12 pr-4 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-neutral-200",
              "outline-none transition-all focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/10"
            )}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex-shrink-0 border",
              activeCategory === cat.id
                ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20"
                : "bg-white/[0.04] border-white/[0.08] text-neutral-500 hover:border-white/[0.2] hover:text-neutral-300"
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Story Grid */}
      <div className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6",
        isLoading ? "opacity-50" : "opacity-100 transition-opacity duration-300"
      )}>
        {isLoading
          ? [...Array(12)].map((_, i) => <StoryCardSkeleton key={i} />)
          : stories.length > 0
          ? stories.map(s => <StoryCard key={s.id} story={s} />)
          : (
            <div className="col-span-full">
              <EmptyState
                title="Không tìm thấy kết quả"
                description={`Không có truyện nào phù hợp với từ khóa "${searchInput}". Thử tìm kiếm với từ khóa khác.`}
                action={
                  <button
                    onClick={() => {
                        setSearchInput('');
                        // Simulate next track logic for error boundary
                    }}
                    className="px-6 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-bold text-neutral-300 hover:bg-white/[0.1] transition-all"
                  >
                    Xóa bộ lọc
                  </button>
                }
              />
            </div>
          )
        }
      </div>

    </div>
  );
}
