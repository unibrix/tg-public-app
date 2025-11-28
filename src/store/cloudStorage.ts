import { cloudStorage } from '@tma.js/sdk-react';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand storage adapter for TMA Cloud Storage
 * Uses localStorage as primary (sync, always works), syncs to cloud when available
 */
export const cloudStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // First try localStorage (immediate, reliable)
    const localValue = localStorage.getItem(name);

    // Then try to get from cloud and sync
    try {
      if (cloudStorage.isSupported() && cloudStorage.getItem.isAvailable()) {
        const cloudValue = await cloudStorage.getItem(name);
        // Cloud storage returns empty string for non-existent keys
        if (cloudValue && cloudValue.length > 0) {
          // Cloud has newer data, update localStorage
          localStorage.setItem(name, cloudValue);
          return cloudValue;
        }
      }
    } catch {
      // Silently fall back to localStorage
    }

    return localValue;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // Always save to localStorage first
    localStorage.setItem(name, value);

    // Then sync to cloud
    try {
      if (cloudStorage.isSupported() && cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem(name, value);
      }
    } catch {
      // Silently continue - localStorage is saved
    }
  },

  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);

    try {
      if (cloudStorage.isSupported() && cloudStorage.deleteItem.isAvailable()) {
        await cloudStorage.deleteItem(name);
      }
    } catch {
      // Silently continue
    }
  },
};
