'use client';

import * as React from 'react';
import {
  Play, Pause, SkipBack, SkipForward, X,
  Volume2, Music2, ChevronRight, ChevronLeft,
  Gauge, Check, RotateCcw, RotateCw, ExternalLink
} from 'lucide-react';
import { useAudioStore } from '@/shared/stores/useAudioStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { Slider } from '@/shared/components/ui/atoms/Slider';

function fmt(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export function FloatingAudioPlayer() {
  const router = useRouter();
  const { track, isPlaying, currentTime, speed, togglePlay, seek, setSpeed, clear } = useAudioStore();
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const speedMenuRef = React.useRef<HTMLDivElement>(null);

  // Next/Prev Handlers
  const handleNextTrack = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTrack = useAudioStore.getState().track;
    if (!currentTrack?.nextTrack) return;

    const { slug, chapterNumber } = currentTrack.nextTrack;
    const url = `/read/${slug}/${chapterNumber}`;

    // If already in reader, navigate normally
    if (window.location.pathname.startsWith('/read/')) {
      router.push(url);
      setTimeout(() => {
        if (window.location.pathname !== url) window.location.href = url;
      }, 500);
    } else {
      // Background update without navigation
      try {
        const storiesApi = (await import('@/shared/services/api.service')).storiesApi;
        const story = await storiesApi.getBySlug(slug);
        const chapter = await storiesApi.getChapter(slug, chapterNumber);
        
        const currentIndex = story.chapters?.findIndex((ch: any) => Number(ch.chapterNumber) === Number(chapterNumber)) ?? -1;
        const nextChapterNum = currentIndex !== -1 ? story.chapters[currentIndex + 1]?.chapterNumber : null;
        const prevChapterNum = currentIndex !== -1 ? story.chapters[currentIndex - 1]?.chapterNumber : null;

        const wordCount = chapter.content?.split(/\s+/)?.length || 0;
        useAudioStore.getState().setTrack({
          id: chapter.id,
          chapterTitle: chapter.title,
          storyTitle: story.title,
          slug,
          chapterNumber: Number(chapterNumber),
          author: story.author?.name || 'StoryVerse',
          coverImage: story.coverImage,
          content: chapter.content,
          durationSec: Math.ceil(wordCount / 2.5),
          nextTrack: nextChapterNum ? { slug, chapterNumber: Number(nextChapterNum) } : undefined,
          prevTrack: prevChapterNum ? { slug, chapterNumber: Number(prevChapterNum) } : undefined,
        });
      } catch (err) {
        console.error('Failed to load next chapter in background:', err);
        router.push(url); // Fallback to navigation
      }
    }
  }, [router]);

  const handlePrevTrack = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTrack = useAudioStore.getState().track;
    if (!currentTrack?.prevTrack) return;

    const { slug, chapterNumber } = currentTrack.prevTrack;
    const url = `/read/${slug}/${chapterNumber}`;

    if (window.location.pathname.startsWith('/read/')) {
      router.push(url);
      setTimeout(() => {
        if (window.location.pathname !== url) window.location.href = url;
      }, 500);
    } else {
      try {
        const storiesApi = (await import('@/shared/services/api.service')).storiesApi;
        const story = await storiesApi.getBySlug(slug);
        const chapter = await storiesApi.getChapter(slug, chapterNumber);
        
        const currentIndex = story.chapters?.findIndex((ch: any) => Number(ch.chapterNumber) === Number(chapterNumber)) ?? -1;
        const nextChapterNum = currentIndex !== -1 ? story.chapters[currentIndex + 1]?.chapterNumber : null;
        const prevChapterNum = currentIndex !== -1 ? story.chapters[currentIndex - 1]?.chapterNumber : null;

        const wordCount = chapter.content?.split(/\s+/)?.length || 0;
        useAudioStore.getState().setTrack({
          id: chapter.id,
          chapterTitle: chapter.title,
          storyTitle: story.title,
          slug,
          chapterNumber: Number(chapterNumber),
          author: story.author?.name || 'StoryVerse',
          coverImage: story.coverImage,
          content: chapter.content,
          durationSec: Math.ceil(wordCount / 2.5),
          nextTrack: nextChapterNum ? { slug, chapterNumber: Number(nextChapterNum) } : undefined,
          prevTrack: prevChapterNum ? { slug, chapterNumber: Number(prevChapterNum) } : undefined,
        });
      } catch (err) {
        router.push(url);
      }
    }
  }, [router]);

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Conditional return MUST be after all Hooks
  if (!track) return null;

  const dur = track.durationSec || 0;
  const speeds = [0.75, 1, 1.25, 1.5, 2] as const;

  return (
    <div className={cn(
      'fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 z-50',
      'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[800px]',
      'rounded-md border border-white/[0.1] bg-[#181818]',
      'shadow-[0_12px_40px_rgba(0,0,0,0.9)] animate-scale-in',
    )}>
      {/* Progress bar — top */}
      <div className="px-4 pt-3 flex items-center gap-3">
        <span className="text-[10px] font-bold text-neutral-500 tabular-nums w-8 text-right shrink-0">{fmt(currentTime)}</span>
        <div className="flex-1">
          <Slider value={currentTime} min={0} max={dur} onChange={seek} />
        </div>
        <span className="text-[10px] font-bold text-neutral-500 tabular-nums w-8 shrink-0">{fmt(dur)}</span>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Cover */}
        <div className="h-10 w-10 rounded overflow-hidden bg-[#282828] shrink-0 border border-white/5 shadow-inner">
          {track.coverImage
            ? <img src={track.coverImage} className="h-full w-full object-cover" alt="" />
            : <div className="h-full w-full flex items-center justify-center"><Music2 className="h-5 w-5 text-neutral-600" /></div>
          }
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-black text-white truncate leading-none tracking-tight">
            {track.chapterTitle}
          </p>
          <p className="text-[9px] text-primary-light/60 truncate font-bold uppercase tracking-wider mt-1.5">
            {track.storyTitle}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevTrack}
            disabled={!track.prevTrack}
            className="p-2 rounded-md text-primary-light hover:text-white hover:bg-primary/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title="Chương trước"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          <button
            onClick={() => seek(Math.max(0, currentTime - 15))}
            className="p-2 rounded-md text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Lùi 15s"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={togglePlay}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            {isPlaying
              ? <Pause className="h-5 w-5 fill-current" />
              : <Play className="h-5 w-5 fill-current translate-x-0.5" />
            }
          </button>

          <button
            onClick={() => seek(Math.min(dur, currentTime + 15))}
            className="p-2 rounded-md text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Tiến 15s"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleNextTrack}
            disabled={!track.nextTrack}
            className="p-2 rounded-md text-primary-light hover:text-white hover:bg-primary/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title="Chương tiếp theo"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
        </div>

        {/* Desktop Extras */}
        <div className="hidden md:flex items-center gap-3 ml-2 border-l border-white/[0.06] pl-3">

          {/* Custom Speed Dropdown */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className={cn(
                "flex items-center gap-2 h-8 px-3 rounded-md border transition-all text-[11px] font-black uppercase tracking-wider",
                showSpeedMenu ? "bg-primary/10 border-primary/30 text-primary-light" : "bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-neutral-200"
              )}
            >
              <Gauge className="h-3.5 w-3.5" />
              {speed}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-32 rounded-lg border border-white/[0.1] bg-[#181818] shadow-2xl overflow-hidden animate-scale-in origin-bottom-right">
                <div className="py-1">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all",
                        speed === s ? "bg-primary text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {s}x
                      {speed === s && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              console.log('[FloatingAudioPlayer] Navigating to:', track.slug, track.chapterNumber);
              if (track.slug && track.chapterNumber) {
                router.push(`/read/${track.slug}/${track.chapterNumber}`);
              } else {
                console.error('[FloatingAudioPlayer] Missing navigation data');
              }
            }}
            className="p-2 rounded-md text-primary-light hover:text-white hover:bg-primary/10 transition-all flex items-center gap-1.5"
            title="Đọc ngay"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Đọc</span>
          </button>

          <button
            onClick={clear}
            className="p-2 rounded-md text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile extras */}
        <div className="md:hidden flex items-center gap-1 shrink-0">
          <button
            onClick={() => router.push(`/read/${track.slug}/${track.chapterNumber}`)}
            className="p-2 rounded text-primary-light"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
          
          <button
            onClick={clear}
            className="p-2 rounded text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
