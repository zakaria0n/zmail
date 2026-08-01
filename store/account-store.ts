/**
 * Zustand store for the active temporary inbox session.
 *
 * This is intentionally minimal: it only owns the authenticated account
 * (address + token) and a couple of UI flags. All server state (messages)
 * lives in React Query, and persistence to localStorage is handled via
 * `utils/storage` on mutations.
 */

import { create } from "zustand";

import type { StoredAccount } from "@/types";
import { clearAccount, loadAccount, saveAccount } from "@/utils/storage";

export type AccountStatus = "idle" | "provisioning" | "ready" | "error";

interface AccountState {
  /** The active mailbox, or null while provisioning/none exists. */
  account: StoredAccount | null;
  /** High-level lifecycle status used to drive loading/error UI. */
  status: AccountStatus;
  /** Last error message surfaced to the user, if any. */
  error: string | null;
  /** Number of unread messages, updated by the inbox poller. */
  unreadCount: number;

  /** Restore an existing session from localStorage on mount. */
  hydrate: () => void;
  /** Replace the active account (after provisioning). */
  setAccount: (account: StoredAccount | null) => void;
  /** Mark provisioning in progress. */
  setProvisioning: () => void;
  /** Record a failure. */
  setError: (message: string) => void;
  /** Destroy the local session. */
  reset: () => void;
  /** Update unread badge count. */
  setUnreadCount: (count: number) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  status: "idle",
  error: null,
  unreadCount: 0,

  hydrate: () => {
    const existing = loadAccount();
    if (existing) {
      set({ account: existing, status: "ready", error: null });
    } else {
      set({ account: null, status: "idle" });
    }
  },

  setAccount: (account) => {
    if (account) {
      saveAccount(account);
      set({ account, status: "ready", error: null });
    } else {
      clearAccount();
      set({ account: null, status: "idle", unreadCount: 0 });
    }
  },

  setProvisioning: () => set({ status: "provisioning", error: null }),

  setError: (message) => set({ status: "error", error: message }),

  reset: () => {
    clearAccount();
    set({ account: null, status: "idle", error: null, unreadCount: 0 });
  },

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
}));
