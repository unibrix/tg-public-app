import { cloudStorage } from '@tma.js/sdk-react';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand storage adapter for TMA Cloud Storage
 * Falls back to localStorage in development or when cloud storage unavailable
 */
export const cloudStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (cloudStorage.isSupported() && cloudStorage.getItem.isAvailable()) {
        const value = await cloudStorage.getItem(name);
        return value || null;
      }
    } catch (e) {
      console.warn('Cloud storage getItem failed, using localStorage', e);
    }
    return localStorage.getItem(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (cloudStorage.isSupported() && cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem(name, value);
        return;
      }
    } catch (e) {
      console.warn('Cloud storage setItem failed, using localStorage', e);
    }
    localStorage.setItem(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      if (cloudStorage.isSupported() && cloudStorage.deleteItem.isAvailable()) {
        await cloudStorage.deleteItem(name);
        return;
      }
    } catch (e) {
      console.warn('Cloud storage removeItem failed, using localStorage', e);
    }
    localStorage.removeItem(name);
  },
};
