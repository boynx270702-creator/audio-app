'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Play, BookOpen, Headphones, TrendingUp, Star,
  Clock, ChevronRight, Flame, Trophy, Zap, Eye, Ghost
} from 'lucide-react';
import { storiesApi } from '@/shared/services/api.service';
import { cn } from '@/shared/utils/cn';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useRouter } from 'next/navigation';

/* ── Story Card ── */
function StoryCard({ story, size = 'md' }: { story: any; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex flex-col gap-2.5"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg bg-[#181818]',
          size === 'lg' ? 'aspect-[2/3]' : 'aspect-[3/4]'
        )}
      >
        <img
          src={story.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Play className="h-3.5 w-3.5 fill-current" />
            Đọc ngay
          </div>
        </div>
        {story.hasAudio && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded px-1.5 py-0.5 text-[10px] font-medium text-green-400">
            <Headphones className="h-3 w-3" /> Audio
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-neutral-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {story.title}
        </h4>
        <p className="text-xs text-neutral-500">{story.author?.name}</p>
      </div>
    </Link>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, href, icon: Icon }: { title: string; href?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="h-5 w-5 text-primary-light" />}
        <h2 className="text-base font-bold text-neutral-100">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function CardSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="aspect-[3/4] rounded-lg bg-white/[0.04] animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-3.5 bg-white/[0.04] rounded animate-pulse w-4/5" />
        <div className="h-3 bg-white/[0.04] rounded animate-pulse w-2/5" />
      </div>
    </div>
  );
}

/* ── Section Empty State ── */
function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01]">
      <Ghost className="h-8 w-8 text-neutral-800 mb-3" />
      <p className="text-xs font-medium text-neutral-600">{message}</p>
    </div>
  );
}

/* ── Horizontal Story Row ── */
function StoryRow({ story, rank }: { story: any; rank?: number }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex items-center gap-3.5 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] -mx-3 px-3 rounded-lg transition-colors"
    >
      {rank !== undefined && (
        <span className={cn(
          'text-lg font-black w-6 text-center shrink-0',
          rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-neutral-400' : rank === 2 ? 'text-amber-700' : 'text-neutral-700'
        )}>
          {rank + 1}
        </span>
      )}
      <div className="h-12 w-9 rounded overflow-hidden bg-[#181818] shrink-0">
        <img
          src={story.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200'}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-200 truncate group-hover:text-white transition-colors">{story.title}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{story.author?.name}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
        <Star className="h-3.5 w-3.5 fill-current" /> 4.8
      </div>
    </Link>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */
export default function HomePage() {
  const [stories, setStories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { addToast } = useToastStore();
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (isInitialized && user?.role === 'ADMIN') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('mode') === 'user') {
        sessionStorage.setItem('admin_user_mode', 'true');
        router.replace('/');
      } else if (!sessionStorage.getItem('admin_user_mode')) {
        router.replace('/admin');
      }
    }
  }, [isInitialized, user, router]);

  React.useEffect(() => {
    storiesApi.getAll(1, 20).then(r => {
      setStories(r.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const featured = stories[0];
  const trending = stories.slice(1, 9);
  const newRelease = stories.slice(0, 6);
  const audioList = stories.slice(0, 5);
  const rankList  = stories.slice(0, 5);

  const handleQuestClaim = (q: string) => {
    addToast(`Đã nhận phần thưởng nhiệm vụ: ${q}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-in">

      {/* ── HERO ── */}
      <section>
        {loading ? (
          <div className="h-72 rounded-lg bg-white/[0.04] animate-pulse" />
        ) : featured ? (
          <div className="relative h-72 md:h-96 rounded-lg overflow-hidden">
            <img
              src={featured.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200'}
              alt={featured.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  <Flame className="h-3 w-3 fill-current" /> Nổi Bật
                </span>
                {featured.hasAudio && (
                  <span className="inline-flex items-center gap-1 bg-green-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    <Headphones className="h-3 w-3" /> Audio
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
                {featured.title}
              </h1>
              <p className="text-sm text-neutral-400 line-clamp-2 mb-5">
                {featured.description ?? 'Hành trình tu tiên đầy gian truân của một phàm nhân vươn lên đỉnh cao bất tử.'}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/read/${featured.slug}/1`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors"
                >
                  <Play className="h-4 w-4 fill-current" /> Đọc Ngay
                </Link>
                <Link
                  href={`/stories/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                >
                  <BookOpen className="h-4 w-4" /> Chi Tiết
                </Link>
              </div>
            </div>
          </div>
        ) : !loading && (
          <SectionEmpty message="Hiện chưa có truyện nổi bật nào được triệu hồi." />
        )}
      </section>

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-10">
        <div className="space-y-12">

          {/* Trending */}
          <section>
            <SectionHeader title="Đang Thịnh Hành" href="/explore" icon={TrendingUp} />
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : trending.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {trending.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
            ) : (
              <SectionEmpty message="Danh sách thịnh hành đang tạm trống." />
            )}
          </section>

          {/* Audio */}
          <section>
            <SectionHeader title="Audio Truyện" href="/explore" icon={Headphones} />
            {loading ? (
              <div className="rounded-lg border border-white/[0.06] bg-[#101010] p-4 space-y-1">
                {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/[0.04] rounded animate-pulse" />)}
              </div>
            ) : audioList.length > 0 ? (
              <div className="rounded-lg border border-white/[0.06] bg-[#101010] p-4 space-y-1">
                {audioList.map(s => <StoryRow key={s.id} story={s} />)}
              </div>
            ) : (
              <SectionEmpty message="Chưa có audio truyện nào khả dụng." />
            )}
          </section>

          {/* New Releases */}
          <section>
            <SectionHeader title="Ra Mắt Mới" href="/explore" icon={Zap} />
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : newRelease.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {newRelease.map(s => <StoryCard key={s.id} story={s} size="sm" />)}
              </div>
            ) : (
              <SectionEmpty message="Thế giới này đang chờ đợi những câu chuyện mới." />
            )}
          </section>
        </div>

        {/* ── SIDEBAR WIDGETS ── */}
        <aside className="space-y-6">
          {/* Daily Quest */}
          <div className="rounded-lg border border-white/[0.06] bg-[#101010] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-neutral-100">Nhiệm Vụ Hằng Ngày</h3>
            </div>
            <div className="flex justify-between text-xs font-medium text-neutral-500 mb-1.5">
              <span>Tiến độ</span><span className="text-amber-400">3 / 5</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-4">
              <div className="h-full w-3/5 rounded-full bg-amber-500" />
            </div>
            {['Đọc 5 phút', 'Nghe 1 chương audio', 'Đăng nhập hôm nay'].map((q, i) => (
              <div
                key={q}
                onClick={() => i < 2 && handleQuestClaim(q)}
                className={cn(
                  'flex items-center gap-2.5 py-2 border-t border-white/[0.05] text-xs group cursor-pointer',
                )}
              >
                <div className={cn(
                  'h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all',
                  i < 2 ? 'bg-amber-500/20 border-amber-500/40 group-hover:scale-110' : 'border-white/[0.12]'
                )}>
                  {i < 2 && <div className="h-2 w-2 rounded-full bg-amber-400" />}
                </div>
                <span className={cn('font-medium flex-1', i < 2 ? 'line-through text-neutral-600' : 'text-neutral-300')}>
                  {q}
                </span>
                {i < 2 && <span className="text-green-400 font-semibold">+50</span>}
              </div>
            ))}
            <Link
              href="/quests"
              className="mt-4 block w-full text-center py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-neutral-300 transition-colors"
            >
              Xem tất cả nhiệm vụ
            </Link>
          </div>

          {/* Ranking */}
          <div className="rounded-lg border border-white/[0.06] bg-[#101010] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-bold text-neutral-100">Bảng Xếp Hạng</h3>
            </div>
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/[0.04] rounded animate-pulse mb-2" />)
            ) : rankList.length > 0 ? (
              rankList.map((s, i) => <StoryRow key={s.id} story={s} rank={i} />)
            ) : (
              <p className="text-[10px] text-neutral-600 italic">Chưa có bảng xếp hạng.</p>
            )}
          </div>

          {/* CTA */}
          <div className="rounded-md border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
            <Zap className="h-8 w-8 mx-auto text-primary-light" />
            <h3 className="font-bold text-neutral-100 text-sm">Nhận 1,000 Linh Thạch</h3>
            <p className="text-xs text-neutral-500">Đăng ký miễn phí, nhận thưởng ngay hôm nay</p>
            <Link
              href="/auth/login"
              className="block w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              Bắt Đầu Tu Luyện
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
