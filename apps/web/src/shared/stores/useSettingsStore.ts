import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReaderTheme = 'default' | 'sepia' | 'dark' | 'gray';

interface SettingsState {
  // Reading
  fontSize: number;
  lineHeight: number;
  readerTheme: ReaderTheme;
  fontFamily: 'sans' | 'serif' | 'mono';
  
  // Audio
  voice: 'male' | 'female';
  
  // Actions
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setReaderTheme: (theme: ReaderTheme) => void;
  setFontFamily: (family: 'sans' | 'serif' | 'mono') => void;
  setVoice: (voice: 'male' | 'female') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 18,
      lineHeight: 1.8,
      readerTheme: 'default',
      fontFamily: 'sans',
      voice: 'female',

      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setReaderTheme: (readerTheme) => set({ readerTheme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setVoice: (voice) => set({ voice }),
    }),
    {
      name: 'sv-settings',
    }
  )
);
