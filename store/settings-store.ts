"use client";

/**
 * User settings store (Zustand) backed by localStorage.
 */

import { create } from "zustand";

import { DEFAULT_SETTINGS, type Settings } from "@/types";
import { loadSettings, saveSettings } from "@/utils/storage";

interface SettingsState extends Settings {
  /** Restore settings from localStorage on mount. */
  hydrate: () => void;
  /** Patch one or more settings and persist. */
  update: (patch: Partial<Settings>) => void;
  /** Reset to defaults. */
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,

  hydrate: () => set({ ...loadSettings() }),

  update: (patch) => {
    set((state) => {
      const next = { ...state, ...patch };
      saveSettings({
        refreshIntervalMs: next.refreshIntervalMs,
        autoRefreshEnabled: next.autoRefreshEnabled,
        pruneExpiredEnabled: next.pruneExpiredEnabled,
      });
      return next;
    });
  },

  reset: () => {
    saveSettings(DEFAULT_SETTINGS);
    set({ ...DEFAULT_SETTINGS });
  },
}));
