import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cloudStorageAdapter } from './cloudStorage';

interface AppState {
  // Settings
  hapticsEnabled: boolean;

  // Wallet
  favoriteCoins: string[];
  holdings: Record<string, number>;

  // Actions
  setHapticsEnabled: (enabled: boolean) => void;
  addFavorite: (coinId: string) => void;
  removeFavorite: (coinId: string) => void;
  toggleFavorite: (coinId: string) => void;
  addHolding: (coinId: string, amount: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hapticsEnabled: true,
      favoriteCoins: [],
      holdings: {},

      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),

      addFavorite: (coinId) =>
        set((state) => ({
          favoriteCoins: state.favoriteCoins.includes(coinId)
            ? state.favoriteCoins
            : [...state.favoriteCoins, coinId],
        })),

      removeFavorite: (coinId) =>
        set((state) => ({
          favoriteCoins: state.favoriteCoins.filter((id) => id !== coinId),
        })),

      toggleFavorite: (coinId) => {
        const { favoriteCoins } = get();
        if (favoriteCoins.includes(coinId)) {
          set({ favoriteCoins: favoriteCoins.filter((id) => id !== coinId) });
        } else {
          set({ favoriteCoins: [...favoriteCoins, coinId] });
        }
      },

      addHolding: (coinId, amount) =>
        set((state) => ({
          holdings: {
            ...state.holdings,
            [coinId]: (state.holdings[coinId] || 0) + amount,
          },
        })),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => cloudStorageAdapter),
    }
  )
);
