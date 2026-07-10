'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAudioStore } from '@/shared/stores/useAudioStore';
import { useSettingsStore } from '@/shared/stores/useSettingsStore';
import { toast } from 'sonner';

export function AudioEngine() {
  const router = useRouter();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const objectUrlRef = React.useRef<string | null>(null);
  const activeEngineRef = React.useRef<'mp3' | 'cloud' | 'browser' | 'none'>('none');
  const fallbackToBrowserTTSRef = React.useRef<(() => void) | null>(null);

  const {
    track,
    isPlaying,
    currentTime,
    speed,
    play,
    pause,
    updateCurrentTime,
    activeCharIndex,
    setActiveCharIndex,
    seekSignal,
    updateTrackDuration,
  } = useAudioStore();

  const { voice: voicePref } = useSettingsStore();

  const [lastTrackId, setLastTrackId] = React.useState<string | null>(null);

  const [voicesLoaded, setVoicesLoaded] = React.useState(false);
  const activeCharIndexRef = React.useRef(0);
  const lastUpdateRef = React.useRef(0);
  // Flag to prevent timeupdate from overwriting a pending seek-to-restore
  const isRestoringRef = React.useRef(false);

  React.useEffect(() => {
    activeCharIndexRef.current = activeCharIndex;
  }, [activeCharIndex]);

  // Initialize Audio & Synth
  React.useEffect(() => {
    audioRef.current = new Audio();
    synthRef.current = window.speechSynthesis;

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      const store = useAudioStore.getState();
      
      // If we are restoring, we should only wait if audio time is extremely close to 0
      // meaning it hasn't seeked yet. But if it has passed 0.5s, we can consider it restored
      // or playing normally.
      if (isRestoringRef.current) {
        if (audio.currentTime < 0.5) return;
        isRestoringRef.current = false;
      }

      updateCurrentTime(audio.currentTime);
      
      // Accurately update activeCharIndex for Cloud TTS based on stable duration
      if (store.track?.content && activeEngineRef.current === 'cloud') {
        const stableDuration = store.track.durationSec || 1;
        const progress = audio.currentTime / stableDuration;
        const estimatedChar = Math.floor(progress * store.track.content.length);
        
        const diff = estimatedChar - store.activeCharIndex;
        if (Math.abs(diff) > 15 || diff < 0) { 
          setActiveCharIndex(Math.max(0, Math.min(estimatedChar, store.track.content.length)));
        }
      }
    };

    const onEnded = () => handleEnded();

    const onLoadedMetadata = () => {
      const store = useAudioStore.getState();
      if (audio.duration && audio.duration !== Infinity && Math.abs((store.track?.durationSec || 0) - audio.duration) > 2) {
        updateTrackDuration(audio.duration);
      }
    };

    // canplay fires when audio is actually seekable — more reliable than loadedmetadata
    const onCanPlay = () => {
      if (!isRestoringRef.current) return;
      const store = useAudioStore.getState();
      const targetTime = store.currentTime;
      if (targetTime > 1 && Math.abs(audio.currentTime - targetTime) > 1) {
        audio.currentTime = targetTime;
        console.log(`[AudioEngine] Restored playback position to ${targetTime.toFixed(1)}s`);
      }
      isRestoringRef.current = false;
    };

    const onError = (e: any) => {
      const store = useAudioStore.getState();
      if (!store.track || !audio.src || audio.src === window.location.href) return;

      const error = audio.error;
      // Ignore MEDIA_ERR_ABORTED (1) and MEDIA_ERR_SRC_NOT_SUPPORTED (4) during track switch/cleanup
      if (error?.code === 1 || error?.code === 4) return;

      console.error('[AudioEngine] Audio Element Error:', {
        code: error?.code,
        message: error?.message,
        src: audio.src
      });
      
      // If Cloud TTS fails, switch engine and trigger fallback
      if (activeEngineRef.current === 'cloud') {
        activeEngineRef.current = 'browser';
        toast.error('Không thể tải âm thanh AI. Đang chuyển sang giọng đọc hệ thống...');
        if (fallbackToBrowserTTSRef.current) {
          fallbackToBrowserTTSRef.current();
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    if (synthRef.current) {
      const updateVoices = () => {
        const voices = synthRef.current?.getVoices();
        if (voices && voices.length > 0) {
          setVoicesLoaded(true);
        }
      };
      synthRef.current.onvoiceschanged = updateVoices;
      updateVoices(); // Check immediately
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.pause();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      synthRef.current?.cancel();
    };
  }, []);

  const handleEnded = React.useCallback(async () => {
    const currentTrack = useAudioStore.getState().track;
    if (currentTrack?.nextTrack) {
      const { slug, chapterNumber } = currentTrack.nextTrack;
      const url = `/read/${slug}/${chapterNumber}`;

      const isReaderPage = window.location.pathname.includes('/read/');

      if (isReaderPage) {
        router.push(url);
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
    } else {
      pause();
    }
  }, [pause, router]);

  // Sync Track Change or Voice Preference Change
  React.useEffect(() => {
    if (!track) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      synthRef.current?.cancel();
      activeEngineRef.current = 'none';
      return;
    }
    
    const isNewTrack = track.id !== lastTrackId;
    // On page reload, lastTrackId is null (React state reset) but store has saved currentTime.
    // We treat this as a RESTORE if currentTime > 0, not a fresh start.
    const storedTime = useAudioStore.getState().currentTime;
    const isPageReload = !lastTrackId && storedTime > 1;
    
    if (isNewTrack) {
      setLastTrackId(track.id);
      if (!isPageReload) {
        // Genuine new track: reset everything
        setActiveCharIndex(0);
        activeCharIndexRef.current = 0;
      }
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Mode: MP3 (Pre-recorded)
    if (track.audioUrl) {
      activeEngineRef.current = 'mp3';
      synthRef.current?.cancel();
      const audio = audioRef.current;
      if (audio) {
        if (isPageReload || (!isNewTrack && storedTime > 1)) {
          isRestoringRef.current = true;
        }
        audio.src = track.audioUrl;
        audio.playbackRate = speed;
        if (isPlaying) audio.play().catch((err) => {
          if (err.name === 'AbortError') return;
        });
      }
    } 
    // Mode: Cloud TTS (High-quality AI)
    else if (track.content) {
      activeEngineRef.current = 'cloud';
      synthRef.current?.cancel();
      const audio = audioRef.current;
      if (audio) {
        const voiceParam = voicePref === 'female' ? 'female' : 'male';
        const synthesizeUrl = `${API_BASE}/tts/chapter/${track.id}?voice=${voiceParam}`;

        if (isPageReload || (!isNewTrack && storedTime > 1)) {
          isRestoringRef.current = true;
        }

        audio.src = synthesizeUrl;
        audio.playbackRate = speed;
        
        if (isPlaying) {
          audio.play().catch((err) => {
            if (err.name === 'AbortError') return;
            console.error('[AudioEngine] Play Error:', err);
            activeEngineRef.current = 'browser';
            if (fallbackToBrowserTTSRef.current) fallbackToBrowserTTSRef.current();
          });
        }
      }
    }

    fallbackToBrowserTTSRef.current = () => {
      console.log('[AudioEngine] Starting Browser TTS Fallback...');
      if (!useAudioStore.getState().track?.content) return;
      activeEngineRef.current = 'browser';
      audioRef.current?.pause();
      synthRef.current?.cancel();

      const contentUtterance = new SpeechSynthesisUtterance(useAudioStore.getState().track!.content);
      contentUtterance.lang = 'vi-VN';
      contentUtterance.rate = useAudioStore.getState().speed;
      
      const findBestVoice = (pref: 'male' | 'female', voices: SpeechSynthesisVoice[]) => {
        const viVoices = voices.filter(v => v.lang.startsWith('vi') || v.lang.includes('VN'));
        if (viVoices.length === 0) return null;

        let best = viVoices.find(v => {
          const name = v.name.toLowerCase();
          const isNatural = name.includes('natural') || name.includes('online') || name.includes('google');
          if (pref === 'female') return (name.includes('female') || name.includes('nữ') || name.includes('hoai') || name.includes('lan')) && isNatural;
          return (name.includes('male') || name.includes('nam') || name.includes('an') || name.includes('minh')) && isNatural;
        });

        if (!best) {
          best = viVoices.find(v => {
            const name = v.name.toLowerCase();
            if (pref === 'female') return name.includes('female') || name.includes('nữ') || name.includes('hoai') || name.includes('lan');
            return name.includes('male') || name.includes('nam') || name.includes('an') || name.includes('minh');
          });
        }
        return best || viVoices[0];
      };

      const voices = synthRef.current?.getVoices() || [];
      const selectedVoice = findBestVoice(useSettingsStore.getState().voice, voices);
      if (selectedVoice) contentUtterance.voice = selectedVoice;

      contentUtterance.onboundary = (event) => {
        if (event.name === 'word') setActiveCharIndex(event.charIndex);
      };
      contentUtterance.onend = () => handleEnded();
      utteranceRef.current = contentUtterance;
      
      if (useAudioStore.getState().isPlaying) {
        synthRef.current?.speak(contentUtterance);
      }
    };
  }, [track?.id, voicePref]);

  // Sync Play/Pause
  React.useEffect(() => {
    if (!track) {
      audioRef.current?.pause();
      synthRef.current?.cancel();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (activeEngineRef.current === 'mp3' || activeEngineRef.current === 'cloud') {
      if (isPlaying) {
        audio.play().catch((err) => {
          if (err.name === 'AbortError') return;
          if (activeEngineRef.current === 'cloud') {
            activeEngineRef.current = 'browser';
            pause();
            if (fallbackToBrowserTTSRef.current) fallbackToBrowserTTSRef.current();
          }
        });
      } else {
        audio.pause();
      }
      synthRef.current?.cancel();
    } 
    else if (activeEngineRef.current === 'browser') {
      audio.pause();
      if (isPlaying) {
        if (fallbackToBrowserTTSRef.current) fallbackToBrowserTTSRef.current();
      } else {
        synthRef.current?.cancel();
      }
    }
  }, [isPlaying]);

  // Handle User Seek
  React.useEffect(() => {
    if (!seekSignal || !track) return;
    
    if ((activeEngineRef.current === 'mp3' || activeEngineRef.current === 'cloud') && audioRef.current) {
      const audio = audioRef.current;
      
      // Only seek if audio is ready, otherwise it might throw or ignore
      if (audio.readyState > 0) {
        audio.currentTime = seekSignal.time;
      } else {
        // If not ready, wait for canplay
        const onReadySeek = () => {
          audio.currentTime = seekSignal.time;
          audio.removeEventListener('canplay', onReadySeek);
        };
        audio.addEventListener('canplay', onReadySeek);
      }

      // Update text highlight instantly for Cloud TTS
      if (activeEngineRef.current === 'cloud' && track.content) {
        const stableDuration = track.durationSec || 1;
        const progress = seekSignal.time / stableDuration;
        const targetChar = Math.floor(progress * track.content.length);
        setActiveCharIndex(Math.max(0, Math.min(targetChar, track.content.length)));
      }
      
    } else if (activeEngineRef.current === 'browser' && track.content && synthRef.current) {
      const dur = track.durationSec || 1;
      const progress = seekSignal.time / dur;
      const targetChar = Math.floor(progress * track.content.length);
      setActiveCharIndex(targetChar);
      
      synthRef.current.cancel();
      const remainingText = track.content.substring(targetChar);
      
      if (remainingText) {
        const utterance = new SpeechSynthesisUtterance(remainingText);
        utterance.lang = 'vi-VN';
        utterance.rate = speed;
        if (utteranceRef.current?.voice) {
          utterance.voice = utteranceRef.current.voice;
        }
        utteranceRef.current = utterance;
        
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            setActiveCharIndex(targetChar + event.charIndex);
          }
        };
        utterance.onend = () => handleEnded();

        if (isPlaying) {
          synthRef.current.speak(utterance);
        }
      }
    }
  }, [seekSignal]);

  // TTS Progress Simulator (Only used for Browser TTS to update progress bar)
  React.useEffect(() => {
    if (!track || !isPlaying || activeEngineRef.current !== 'browser') return;

    let lastTime = Date.now();
    let frameId: number;

    const updateProgress = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      const store = useAudioStore.getState();
      if (!store.isPlaying) return;

      const newTime = Math.min((track.durationSec || 0), store.currentTime + dt * speed);
      updateCurrentTime(newTime);
      
      if (newTime >= (track.durationSec || 0)) {
        handleEnded();
      } else {
        frameId = requestAnimationFrame(updateProgress);
      }
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, [track, isPlaying, speed, handleEnded, updateCurrentTime]);

  // Sync Speed
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
    if (utteranceRef.current) utteranceRef.current.rate = speed;
  }, [speed]);

  return null;
}
