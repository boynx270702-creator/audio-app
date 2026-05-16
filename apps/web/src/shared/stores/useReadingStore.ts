import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReadingProgress {
  storySlug: string;
  chapterNumber: number;
  updatedAt: number;
}

interface ReadingState {
  history: Record<string, ReadingProgress>;
  saveProgress: (storySlug: string, chapterNumber: number) => void;
  getProgress: (storySlug: string) => number | null;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      history: {},
      saveProgress: (storySlug, chapterNumber) => {
        set((state) => ({
          history: {
            ...state.history,
            [storySlug]: {
              storySlug,
              chapterNumber,
              updatedAt: Date.now(),
            },
          },
        }));
      },
      getProgress: (storySlug) => {
        return get().history[storySlug]?.chapterNumber || null;
      },
    }),
    {
      name: 'sv-reading-history',
    }
  )
);
