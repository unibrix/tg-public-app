import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cloudStorageAdapter } from './cloudStorage';

interface AppState {
  // Settings
  hapticsEnabled: boolean;

  // Actions
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => cloudStorageAdapter),
    }
  )
);
