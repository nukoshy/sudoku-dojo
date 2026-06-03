import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audio } from '@/audio/engine';

interface SettingsStore {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  reducedMotion: boolean;
  streakVisible: boolean;
  setSound: (on: boolean) => void;
  setAmbient: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setStreakVisible: (on: boolean) => void;
  syncSystemMotion: () => void;
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      ambientEnabled: false,
      reducedMotion: Boolean(prefersReducedMotion),
      streakVisible: true,
      setSound: (on) => {
        audio.setEnabled(on);
        set({ soundEnabled: on });
      },
      setAmbient: (on) => {
        audio.setAmbient(on);
        set({ ambientEnabled: on });
      },
      setReducedMotion: (on) => set({ reducedMotion: on }),
      setStreakVisible: (on) => set({ streakVisible: on }),
      syncSystemMotion: () =>
        set({
          reducedMotion:
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
        }),
    }),
    {
      name: 'dojo-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          audio.setEnabled(state.soundEnabled);
          audio.setAmbient(state.ambientEnabled);
        }
      },
    },
  ),
);
