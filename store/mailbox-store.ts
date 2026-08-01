"use client";

/**
 * Multi-mailbox store (Zustand).
 *
 * Owns the list of mailboxes, the active selection, and high-level
 * provisioning status. All mutations persist to localStorage via the storage
 * layer so state survives reloads.
 */

import { create } from "zustand";

import type { Mailbox } from "@/types";
import {
  loadMailboxStore,
  saveMailboxStore,
  updateMailboxInStorage,
} from "@/utils/storage";

export type ProvisionStatus = "idle" | "provisioning" | "ready" | "error";

interface MailboxState {
  mailboxes: Mailbox[];
  activeId: string | null;
  status: ProvisionStatus;
  error: string | null;
  /** Total unread count across the active mailbox's inbox. */
  unreadCount: number;

  /** Restore persisted mailboxes from localStorage (run once on mount). */
  hydrate: (prune?: boolean) => void;
  /** The active mailbox object (derived). */
  active: () => Mailbox | null;

  /** Adds a freshly-provisioned mailbox and activates it. */
  addMailbox: (mailbox: Mailbox, activate?: boolean) => void;
  /** Replaces an existing mailbox by id (e.g. after a token refresh). */
  patchMailbox: (id: string, patch: Partial<Mailbox>) => void;
  /** Sets a custom user label for a mailbox. */
  renameMailbox: (id: string, label: string) => void;
  /** Toggles the favorite flag. */
  toggleFavorite: (id: string) => void;
  /** Switches the active mailbox. */
  setActive: (id: string) => void;
  /** Deletes a mailbox; reselects another if it was active. */
  removeMailbox: (id: string) => void;
  /** Replaces the entire set (used by import). */
  replaceAll: (mailboxes: Mailbox[], activeId?: string | null) => void;
  /** Wipes everything (used by "clear all data"). */
  reset: () => void;

  setProvisioning: () => void;
  setReady: () => void;
  setError: (message: string) => void;
  setUnreadCount: (count: number) => void;
}

function persist(mailboxes: Mailbox[], activeId: string | null) {
  saveMailboxStore({ version: 1, mailboxes, activeId });
}

export const useMailboxStore = create<MailboxState>((set, get) => ({
  mailboxes: [],
  activeId: null,
  status: "idle",
  error: null,
  unreadCount: 0,

  hydrate: (prune = true) => {
    const data = loadMailboxStore(prune);
    set({
      mailboxes: data.mailboxes,
      activeId: data.activeId,
      status: data.mailboxes.length > 0 ? "ready" : "idle",
      error: null,
    });
  },

  active: () => {
    const { mailboxes, activeId } = get();
    return mailboxes.find((m) => m.id === activeId) ?? null;
  },

  addMailbox: (mailbox, activate = true) => {
    const mailboxes = [
      mailbox,
      ...get().mailboxes.filter((m) => m.id !== mailbox.id),
    ];
    const activeId = activate ? mailbox.id : (get().activeId ?? mailbox.id);
    persist(mailboxes, activeId);
    set({ mailboxes, activeId, status: "ready", error: null, unreadCount: 0 });
  },

  patchMailbox: (id, patch) => {
    const mailboxes = get().mailboxes.map((m) =>
      m.id === id ? { ...m, ...patch } : m,
    );
    persist(mailboxes, get().activeId);
    set({ mailboxes });
  },

  renameMailbox: (id, label) => {
    updateMailboxInStorage(id, { label: label || undefined });
    const mailboxes = get().mailboxes.map((m) =>
      m.id === id ? { ...m, label: label || undefined } : m,
    );
    set({ mailboxes });
  },

  toggleFavorite: (id) => {
    const mailboxes = get().mailboxes.map((m) =>
      m.id === id ? { ...m, favorite: !m.favorite } : m,
    );
    persist(mailboxes, get().activeId);
    set({ mailboxes });
  },

  setActive: (id) => {
    if (!get().mailboxes.some((m) => m.id === id)) return;
    persist(get().mailboxes, id);
    set({ activeId: id, unreadCount: 0 });
  },

  removeMailbox: (id) => {
    const remaining = get().mailboxes.filter((m) => m.id !== id);
    const wasActive = get().activeId === id;
    const activeId = wasActive ? (remaining[0]?.id ?? null) : get().activeId;
    persist(remaining, activeId);
    set({
      mailboxes: remaining,
      activeId,
      status: remaining.length > 0 ? "ready" : "idle",
      unreadCount: 0,
    });
  },

  replaceAll: (mailboxes, activeId) => {
    const nextActive = activeId && mailboxes.some((m) => m.id === activeId)
      ? activeId
      : (mailboxes[0]?.id ?? null);
    persist(mailboxes, nextActive);
    set({
      mailboxes,
      activeId: nextActive,
      status: mailboxes.length > 0 ? "ready" : "idle",
      error: null,
    });
  },

  reset: () => {
    persist([], null);
    set({
      mailboxes: [],
      activeId: null,
      status: "idle",
      error: null,
      unreadCount: 0,
    });
  },

  setProvisioning: () => set({ status: "provisioning", error: null }),
  setReady: () => set({ status: "ready", error: null }),
  setError: (message) => set({ status: "error", error: message }),
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
}));
