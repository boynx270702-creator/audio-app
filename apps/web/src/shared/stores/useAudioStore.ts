'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AudioSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

interface AudioTrack {
  id: string;
  storyTitle: string;
  chapterTitle: string;
  slug: string;
  chapterNumber: number;
  audioUrl?: string;
  content?: string; 
  author?: string;
  durationSec?: number;
  coverImage?: string;
  nextTrack?: {
    slug: string;
    chapterNumber: number;
  };
  prevTrack?: {
    slug: string;
    chapterNumber: number;
  };
}

interface AudioState {
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number; // seconds
  activeCharIndex: number; // For highlighting
  seekSignal: { time: number; timestamp: number } | null;
  speed: AudioSpeed;
  sleepTimerSec: number | null;

  setTrack: (track: AudioTrack) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setSpeed: (speed: AudioSpeed) => void;
  setSleepTimer: (seconds: number | null) => void;
  updateCurrentTime: (seconds: number) => void;
  setActiveCharIndex: (index: number) => void;
  updateTrackDuration: (durationSec: number) => void;
  clear: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      track: null,
      isPlaying: false,
      currentTime: 0,
      activeCharIndex: 0,
      seekSignal: null,
      speed: 1,
      sleepTimerSec: null,

      setTrack: (track) => set({ track, currentTime: 0, activeCharIndex: 0, isPlaying: true }),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      seek: (seconds) => set({ currentTime: seconds, seekSignal: { time: seconds, timestamp: Date.now() } }),
      setSpeed: (speed) => set({ speed }),
      setSleepTimer: (seconds) => set({ sleepTimerSec: seconds }),
      updateCurrentTime: (seconds) => set({ currentTime: seconds }),
      setActiveCharIndex: (activeCharIndex) => set({ activeCharIndex }),
      updateTrackDuration: (durationSec) => set((s) => ({ track: s.track ? { ...s.track, durationSec } : null })),
      clear: () => set({ track: null, isPlaying: false, currentTime: 0, activeCharIndex: 0 }),
    }),
    {
      name: 'sv-audio',
      partialize: (state) => ({
        track: state.track,
        currentTime: state.currentTime,
        speed: state.speed,
      }),
    },
  ),
);
