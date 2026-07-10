'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Settings2, BookOpen,
  Headphones, Shield, Zap,
  Sun, Moon, Eye, Type, AlignLeft, Monitor
} from 'lucide-react';
import { storiesApi } from '@/shared/services/api.service';
import { useAudioStore } from '@/shared/stores/useAudioStore';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useSettingsStore, ReaderTheme } from '@/shared/stores/useSettingsStore';
import { useReadingStore } from '@/shared/stores/useReadingStore';
import { Button } from '@/shared/components/ui/atoms/Button';
import { cn } from '@/shared/utils/cn';

interface ReaderThemeConfig {
  id: ReaderTheme;
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
}

const THEMES: ReaderThemeConfig[] = [
  { id: 'dark', label: 'Tối', icon: <Moon className="h-4 w-4" />, bg: '#080808', text: '#ffffff', border: '#1a1a1a' },
  { id: 'sepia', label: 'Kem', icon: <BookOpen className="h-4 w-4" />, bg: '#f5ede0', text: '#3d2b1f', border: '#d4b896' },
  { id: 'gray', label: 'Xám', icon: <Eye className="h-4 w-4" />, bg: '#1a1a1a', text: '#ffffff', border: '#2a2a2a' },
  { id: 'default', label: 'Mặc định', icon: <Sun className="h-4 w-4" />, bg: '#0a0a0a', text: '#ffffff', border: '#1a1a1a' },
];

export default function ReaderPage() {
  const params = useParams<{ slug: string; chapter: string }>();
  const router = useRouter();
  const { setTrack, track, isPlaying } = useAudioStore();
  const { user, isAuthenticated } = useAuthStore();
  const { saveProgress } = useReadingStore();
  
  // Settings
  const { 
    fontSize, setFontSize, lineHeight, setLineHeight, 
    readerTheme, setReaderTheme, fontFamily,
    voice, setVoice 
  } = useSettingsStore();

  const [chapter, setChapter] = React.useState<any>(null);
  const [story, setStory] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const chapterNum = Number(params.chapter);

  const load = React.useCallback(async () => {
    if (!params.slug || isNaN(chapterNum) || params.slug === 'undefined') {
      router.push('/');
      return;
    }
    setIsLoading(true);
    try {
      const [storyData, chapterData] = await Promise.all([
        storiesApi.getBySlug(params.slug),
        storiesApi.getChapter(params.slug, chapterNum),
      ]);
      setStory(storyData);
      setChapter(chapterData);
      saveProgress(params.slug, chapterNum);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug, chapterNum]);

  React.useEffect(() => { load(); }, [load]);

  const currentIndex = story?.chapters?.findIndex((ch: any) => Number(ch.chapterNumber) === Number(chapterNum)) ?? -1;
  const nextChapter = currentIndex !== -1 ? story?.chapters[currentIndex + 1]?.chapterNumber : null;
  const prevChapter = currentIndex !== -1 ? story?.chapters[currentIndex - 1]?.chapterNumber : null;

  // Sync audio track if already playing when chapter changes
  React.useEffect(() => {
    if (isPlaying && track && chapter && story && track.id !== chapter.id) {
      const wordCount = chapter.content?.split(/\s+/)?.length || 0;
      setTrack({
        id: chapter.id,
        chapterTitle: chapter.title,
        storyTitle: story.title,
        author: story.author?.name || 'StoryVerse',
        coverImage: story.coverImage,
        content: chapter.content,
        durationSec: Math.ceil(wordCount / 2.5),
        nextTrack: nextChapter ? { slug: params.slug as string, chapterNumber: Number(nextChapter) } : undefined,
        prevTrack: prevChapter ? { slug: params.slug as string, chapterNumber: Number(prevChapter) } : undefined,
      });
    }
  }, [chapter?.id, story?.id, isPlaying, nextChapter, prevChapter]);

  const handleUnlock = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (!chapter?.id) return;
    setIsUnlocking(true);
    try {
      await storiesApi.unlockChapter(chapter.id);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể mở khóa chương này.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleListen = () => {
    if (!chapter || !story) return;
    const wordCount = chapter.content?.split(/\s+/)?.length || 0;
    
    setTrack({
      id: chapter.id,
      chapterTitle: chapter.title,
      storyTitle: story.title,
      slug: params.slug as string,
      chapterNumber: chapterNum,
      author: story.author?.name || 'StoryVerse',
      coverImage: story.coverImage,
      content: chapter.content,
      durationSec: Math.ceil(wordCount / 2.5),
      nextTrack: nextChapter ? { slug: params.slug as string, chapterNumber: Number(nextChapter) } : undefined,
      prevTrack: prevChapter ? { slug: params.slug as string, chapterNumber: Number(prevChapter) } : undefined,
    });
  };

  const totalChapters = story?.chapters?.length ?? 0;

  const currentTheme = THEMES.find(t => t.id === readerTheme) || THEMES[0];

  // Removed word-by-word highlighting logic for better performance

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808]">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-xs font-bold text-neutral-500 animate-pulse uppercase tracking-widest">Mở cánh cổng...</p>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}>

      {/* Reader Navbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 md:px-8 backdrop-blur-xl transition-all"
        style={{ backgroundColor: `${currentTheme.bg}cc`, borderColor: currentTheme.border }}>

        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/stories/${params.slug}`)}
            className="h-10 w-10 rounded-lg hover:bg-black/10 flex items-center justify-center transition-colors" style={{ color: currentTheme.text }}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Đang Đọc</p>
            <p className="text-sm font-bold truncate max-w-[240px]">{story?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Listen Button */}
          <button
            onClick={handleListen}
            className="flex items-center gap-2 h-9 px-4 rounded-md font-black text-[10px] uppercase tracking-wider transition-all border bg-primary/10 border-primary/20 text-primary-light hover:bg-primary/20">
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Nghe</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn("h-9 w-9 rounded-md flex items-center justify-center transition-all border",
              showSettings ? "border-primary/40 text-primary-light" : "border-transparent opacity-50 hover:opacity-100"
            )}>
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="sticky top-16 z-30 border-b px-4 py-6 md:px-8 shadow-2xl animate-page-in"
          style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border }}>
          <div className="max-w-xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Cỡ Chữ</span>
                  <span className="text-xs font-bold text-primary-light">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                    className="h-8 w-8 rounded-md border flex items-center justify-center text-sm font-bold transition-all hover:bg-black/5"
                    style={{ borderColor: currentTheme.border }}>-</button>
                  <input type="range" min="14" max="32" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-primary" />
                  <button onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                    className="h-8 w-8 rounded-md border flex items-center justify-center text-sm font-bold transition-all hover:bg-black/5"
                    style={{ borderColor: currentTheme.border }}>+</button>
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Dãn Dòng</span>
                  <span className="text-xs font-bold text-primary-light">{lineHeight}x</span>
                </div>
                <div className="flex gap-2">
                  {[1.6, 1.8, 2.0, 2.2].map(lh => (
                    <button key={lh} onClick={() => setLineHeight(lh)}
                      className={cn("flex-1 h-8 rounded-md text-[11px] font-bold border transition-all",
                        lineHeight === lh ? "border-primary bg-primary/10 text-primary-light" : "border-transparent opacity-40 hover:opacity-100"
                      )}
                      style={{ borderColor: lineHeight === lh ? undefined : currentTheme.border }}
                    >{lh}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Màu nền</span>
              <div className="flex gap-3">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setReaderTheme(t.id)}
                    className={cn("flex-1 flex items-center justify-center gap-2 h-10 rounded-md text-[11px] font-bold border transition-all",
                      readerTheme === t.id ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-50"
                    )}
                    style={{ backgroundColor: t.bg, color: t.text, borderColor: readerTheme === t.id ? undefined : currentTheme.border }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector */}
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: currentTheme.border }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Giọng Đọc AI</span>
                <span className="text-[10px] font-bold text-primary-light uppercase">Tiếng Việt</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'male', label: 'Giọng Nam', icon: <Monitor className="h-3 w-3" /> },
                  { id: 'female', label: 'Giọng Nữ', icon: <Monitor className="h-3 w-3" /> }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id as any)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-10 rounded-md text-[11px] font-bold border transition-all",
                      voice === v.id 
                        ? "bg-primary/10 border-primary text-primary-light shadow-lg shadow-primary/5" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    style={{ borderColor: voice === v.id ? undefined : currentTheme.border }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-5 py-16 md:py-24">
          {/* Chapter Header */}
          <header className="mb-16 text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Chương {chapter.chapterNumber}</p>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.1)]">{chapter.title}</h1>
            <div className="mx-auto h-1 w-12 bg-blue-500/20 rounded-full mt-8" />
          </header>

          {chapter.isLocked ? (
            <div className="rounded-lg border p-12 text-center space-y-8"
              style={{ borderColor: `${currentTheme.border}`, backgroundColor: `rgba(0,0,0,0.02)` }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border bg-amber-500/10 border-amber-500/20">
                <Shield className="h-8 w-8 text-amber-500" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-black text-amber-500">Nội dung đã được phong ấn</h2>
                <p className="text-xs font-medium opacity-50 max-w-xs mx-auto">Cần tiêu hao Linh Thạch để giải ấn và tiếp tục hành trình tu luyện.</p>
              </div>
              <button onClick={handleUnlock} disabled={isUnlocking}
                className="w-full max-w-sm h-12 rounded-lg bg-amber-500 text-black font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50">
                {isUnlocking ? 'Đang giải ấn...' : `Mở Khóa — ${chapter.price || 50} ◆ Linh Thạch`}
              </button>
            </div>
          ) : (
            <div
              className="prose max-w-none transition-all duration-300"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                fontFamily: fontFamily === 'serif' ? 'ui-serif, Georgia, serif' : 'var(--font-sans)',
                color: currentTheme.text,
              }}
            >
              {chapter.content.split('\n').map((p: string, pIdx: number) => {
                if (!p.trim()) return null;
                return (
                  <p key={pIdx} className="mb-8 leading-relaxed text-justify">
                    {p}
                  </p>
                );
              })}
            </div>
          )}
        </article>
      </main>


      {/* Footer Navigation */}
      <footer className="sticky bottom-0 flex h-20 items-center justify-between border-t px-4 md:px-12 backdrop-blur-xl"
        style={{ backgroundColor: `${currentTheme.bg}ee`, borderColor: currentTheme.border }}>
        <button
          disabled={!prevChapter}
          onClick={() => router.push(`/read/${params.slug}/${prevChapter}`)}
          className="flex items-center gap-2 h-10 px-6 rounded-md border font-bold text-xs transition-all disabled:opacity-10 hover:border-primary/40"
          style={{ borderColor: currentTheme.border }}>
          <ChevronLeft className="h-4 w-4" /> Trước
        </button>

        <div className="flex items-center gap-2 text-[10px] font-black opacity-30 uppercase tracking-widest">
          <span>{chapterNum}</span>
          <div className="h-1 w-1 rounded-full bg-current" />
          <span>{totalChapters}</span>
        </div>

        <button
          disabled={!nextChapter}
          onClick={() => router.push(`/read/${params.slug}/${nextChapter}`)}
          className="flex items-center gap-2 h-10 px-8 rounded-md font-black text-xs transition-all disabled:opacity-10 bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20">
          Tiếp Theo <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
