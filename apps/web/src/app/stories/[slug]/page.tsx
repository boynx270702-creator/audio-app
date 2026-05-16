'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, BookOpen, Star, Share2, Heart, Eye, MessageSquare,
  ChevronLeft, Layers, ArrowRight, Clock, Headphones, Crown,
  Zap, Lock, CheckCircle2, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { storiesApi } from '@/shared/services/api.service';
import { useReadingStore } from '@/shared/stores/useReadingStore';
import { useAudioStore } from '@/shared/stores/useAudioStore';
import { Button } from '@/shared/components/ui/atoms/Button';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';

export default function StoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [story, setStory] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [liked, setLiked] = React.useState(false);
  const { getProgress } = useReadingStore();
  const { setTrack } = useAudioStore();
  const lastChapterNum = getProgress(params.slug);

  const [chapters, setChapters] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pagination, setPagination] = React.useState<any>(null);
  const [isChaptersLoading, setIsChaptersLoading] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await storiesApi.getBySlug(params.slug);
        setStory(data);
        // Load first page of chapters
        loadChapters(1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.slug]);

  const loadChapters = async (page: number) => {
    setIsChaptersLoading(true);
    try {
      const result = await storiesApi.getPaginatedChapters(params.slug, page, 100);
      setChapters(result.chapters);
      setPagination(result.meta);
      setCurrentPage(page);
      
      // Scroll to chapter list header on page change
      if (page !== 1) {
        const el = document.getElementById('chapter-list-header');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Failed to load chapters:', err);
    } finally {
      setIsChaptersLoading(false);
    }
  };

  const handleListen = async () => {
    if (!story) return;
    try {
      const targetChapterNum = lastChapterNum || 1;
      const chapter = await storiesApi.getChapter(story.slug, targetChapterNum);
      const wordCount = chapter.content?.split(/\s+/)?.length || 0;
      
      // Since we don't have all chapters, we estimate next/prev or fetch metadata if needed
      // For now, let's just assume next is current + 1 if current < total
      const totalChapters = story._count?.chapters || 0;
      const nextChapterNum = targetChapterNum < totalChapters ? targetChapterNum + 1 : null;
      const prevChapterNum = targetChapterNum > 1 ? targetChapterNum - 1 : null;

      setTrack({
        id: chapter.id,
        chapterTitle: chapter.title,
        storyTitle: story.title,
        slug: story.slug,
        chapterNumber: targetChapterNum,
        author: story.author?.name || 'StoryVerse',
        coverImage: story.coverImage,
        content: chapter.content,
        durationSec: Math.ceil(wordCount / 2.5),
        nextTrack: nextChapterNum ? { slug: story.slug, chapterNumber: Number(nextChapterNum) } : undefined,
        prevTrack: prevChapterNum ? { slug: story.slug, chapterNumber: Number(prevChapterNum) } : undefined,
      });
    } catch (err) {
      console.error('Failed to load audio:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="font-fantasy text-sm text-muted-foreground animate-pulse">Triệu hồi thế giới...</p>
        </div>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="h-10 rounded-xl gap-2 text-muted-foreground hover:text-foreground hover:bg-void-800 -ml-2"
      >
        <ChevronLeft className="h-4 w-4" /> Quay Lại
      </Button>

      {/* ====== HERO SECTION ====== */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-void-800">
        {/* Background Blur from Cover */}
        {story.coverImage && (
          <div className="absolute inset-0">
            <img src={story.coverImage} className="h-full w-full object-cover scale-110 blur-2xl opacity-20" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-void-900 via-void-900/90 to-void-900/60" />
          </div>
        )}

        <div className="relative z-10 grid lg:grid-cols-[280px_1fr] gap-10 p-8 md:p-12">
          {/* Cover */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative group">
              <div className="w-48 lg:w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border/40 shadow-[0_0_60px_rgba(124,58,237,0.2)]">
                <img
                  src={story.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600'}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={story.title}
                />
              </div>
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {['Tu Tiên', 'Huyền Huyễn', 'Đang Cập Nhật'].map(tag => (
                <span key={tag} className="text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest glass border border-primary/20 text-primary-light">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="font-fantasy text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">
                {story.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-void-700 border border-border/40 overflow-hidden flex items-center justify-center">
                  <span className="text-xs font-black text-foreground">{story.author?.name?.[0]}</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">{story.author?.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">· Tác Giả</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: <Eye className="h-4 w-4" />, label: '24.5k', color: 'text-celestial' },
                { icon: <Heart className="h-4 w-4" />, label: '1.2k', color: 'text-crimson' },
                { icon: <MessageSquare className="h-4 w-4" />, label: '482', color: 'text-jade' },
                { icon: <Layers className="h-4 w-4" />, label: `${story._count?.chapters || 0} Chương`, color: 'text-gold' },
                { icon: <Star className="h-4 w-4 fill-gold text-gold" />, label: '4.8', color: 'text-gold' },
              ].map((stat, i) => (
                <div key={i} className={cn("flex items-center gap-2 text-sm font-bold", stat.color)}>
                  {stat.icon}
                  <span className="text-foreground">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-base font-medium text-muted-foreground leading-relaxed max-w-2xl line-clamp-4">
              {story.description || 'Một câu chuyện về hành trình tu luyện đầy gian truân nhưng không kém phần hào hứng của một phàm nhân vươn lên đỉnh cao bất tử.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {lastChapterNum ? (
                <Link href={`/read/${story.slug}/${lastChapterNum}`}
                  className="flex items-center gap-3 h-14 px-10 rounded-md bg-gradient-to-r from-primary to-primary-dark text-white font-black text-base shadow-xl shadow-primary/30 hover:scale-105 transition-all active:scale-95">
                  <Play className="h-5 w-5 fill-current" />
                  Tiếp Tục Đọc (C.{lastChapterNum})
                </Link>
              ) : (
                <Link href={`/read/${story.slug}/1`}
                  className="flex items-center gap-3 h-14 px-10 rounded-md bg-gradient-to-r from-primary to-primary-dark text-white font-black text-base shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all active:scale-95">
                  <BookOpen className="h-5 w-5" />
                  Bắt Đầu Đọc
                </Link>
              )}
              <button 
                onClick={handleListen}
                className="flex items-center gap-3 h-14 px-8 rounded-2xl glass border border-jade/30 text-jade font-black hover:bg-jade/10 transition-all">
                <Headphones className="h-5 w-5" />
                Nghe Audio
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center transition-all border",
                  liked
                    ? "bg-crimson/20 border-crimson/40 text-crimson-light"
                    : "glass border-border/40 text-muted-foreground hover:text-crimson hover:border-crimson/30"
                )}>
                <Heart className={cn("h-6 w-6", liked ? "fill-current" : "")} />
              </button>
              <button className="h-14 w-14 rounded-2xl glass border border-border/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all">
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== CONTENT AREA ====== */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Chapter List */}
        <div className="space-y-6">
          <div id="chapter-list-header" className="flex items-center justify-between scroll-mt-24">
            <h2 className="font-fantasy text-2xl font-black text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/15">
                <BookOpen className="h-5 w-5 text-primary-light" />
              </div>
              Danh Sách Chương
            </h2>
            <span className="text-sm font-bold text-muted-foreground bg-void-800 px-4 py-2 rounded-xl border border-border/40">
              {story._count?.chapters || 0} chương
            </span>
          </div>

          <div className={cn("space-y-2 transition-opacity duration-300", isChaptersLoading ? "opacity-40 pointer-events-none" : "opacity-100")}>
            {chapters.map((ch: any) => (
              <Link
                key={ch.id}
                href={`/read/${story.slug}/${ch.chapterNumber}`}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-void-800/50 hover:bg-void-800 hover:border-primary/30 transition-all duration-200"
              >
                {/* Chapter Number */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-void-700 border border-border/40 font-black text-sm text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary-light group-hover:border-primary/30 transition-all font-fantasy">
                  {ch.chapterNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-gold transition-colors truncate">{ch.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 12 phút</span>
                    <span className="flex items-center gap-1"><Headphones className="h-3 w-3 text-jade" /> Audio</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ch.isLocked ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold">
                      <Lock className="h-3 w-3" />
                      <span className="text-[10px] font-black">Khoá</span>
                    </div>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-jade opacity-60" />
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1 || isChaptersLoading}
                onClick={() => loadChapters(1)}
                className="glass border-border/40 hover:bg-primary/20"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1 || isChaptersLoading}
                onClick={() => loadChapters(currentPage - 1)}
                className="glass border-border/40 hover:bg-primary/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      className={cn(
                        "h-10 w-10 rounded-xl font-bold",
                        currentPage === pageNum 
                          ? "bg-primary text-white shadow-lg shadow-primary/30" 
                          : "glass border-border/40 hover:bg-primary/10"
                      )}
                      onClick={() => loadChapters(pageNum)}
                      disabled={isChaptersLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === pagination.totalPages || isChaptersLoading}
                onClick={() => loadChapters(currentPage + 1)}
                className="glass border-border/40 hover:bg-primary/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === pagination.totalPages || isChaptersLoading}
                onClick={() => loadChapters(pagination.totalPages)}
                className="glass border-border/40 hover:bg-primary/20"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 sticky top-[72px] h-fit">
          {/* Story Insights */}
          <div className="rounded-2xl border border-border/40 bg-void-800 p-6 space-y-5">
            <h3 className="font-fantasy text-lg font-black text-white">Thông Tin Truyện</h3>
            {[
              { label: 'Lượt Xem', value: '24.5k', icon: <Eye className="h-4 w-4 text-celestial" /> },
              { label: 'Yêu Thích', value: '1.2k', icon: <Heart className="h-4 w-4 text-crimson" /> },
              { label: 'Bình Luận', value: '482', icon: <MessageSquare className="h-4 w-4 text-jade" /> },
              { label: 'Số Chương', value: story._count?.chapters || 0, icon: <Layers className="h-4 w-4 text-gold" /> },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  {stat.icon}
                  <span className="text-sm font-semibold">{stat.label}</span>
                </div>
                <span className="text-sm font-black text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-void-800 p-6 space-y-4">
            <h3 className="font-fantasy text-lg font-black text-white">Đánh Giá</h3>
            <div className="flex items-center gap-3">
              <span className="font-fantasy text-5xl font-bold gradient-gold-text">4.8</span>
              <div className="space-y-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-5 w-5", i < 5 ? "text-gold fill-current" : "text-muted-foreground")} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">482 đánh giá</p>
              </div>
            </div>
          </div>

          {/* VIP Card */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-void-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-gold" />
              <h3 className="font-fantasy text-lg font-bold gradient-gold-text">VIP Membership</h3>
            </div>
            <ul className="space-y-2 text-sm font-medium text-muted-foreground">
              {['Đọc không giới hạn tất cả chương', 'Nghe audio chất lượng cao', 'Không quảng cáo', 'Ưu tiên ra mắt sớm'].map(b => (
                <li key={b} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gold flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/wallet" className="block w-full py-3 rounded-md bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-black text-center hover:opacity-90 transition-all">
              Nâng Cấp VIP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
