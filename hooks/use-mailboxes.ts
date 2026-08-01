"use client";

/**
 * Mailbox lifecycle + management hooks.
 *
 * These wrap the service layer and the Zustand store so UI components stay
 * declarative: call `useProvisionMailbox().provision()` to create a new inbox,
 * `useSwitchMailbox` to change the active one, etc.
 */

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ensureValidToken,
  fetchDomains,
  provisionMailbox,
  provisionMailboxAuto,
} from "@/services/account";
import { useMailboxStore } from "@/store/mailbox-store";
import type { Domain, Mailbox } from "@/types";

/** Provisions a brand-new mailbox (auto-picks an active domain). */
export function useProvisionMailbox() {
  const addMailbox = useMailboxStore((s) => s.addMailbox);
  const setProvisioning = useMailboxStore((s) => s.setProvisioning);
  const setError = useMailboxStore((s) => s.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signal: AbortSignal | undefined) =>
      provisionMailboxAuto(signal),
    onMutate: () => setProvisioning(),
    onSuccess: (mailbox) => {
      addMailbox(mailbox);
      queryClient.removeQueries();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate an inbox. Please try again.";
      setError(message);
    },
  });
}

/** Fetches available domains (for the domain picker in the mailbox manager). */
export function useDomains() {
  return useMutation({
    mutationFn: (signal: AbortSignal | undefined) => fetchDomains(signal),
  });
}

/** Provisions a mailbox against a user-chosen domain. */
export function useProvisionWithDomain() {
  const addMailbox = useMailboxStore((s) => s.addMailbox);
  const setProvisioning = useMailboxStore((s) => s.setProvisioning);
  const setError = useMailboxStore((s) => s.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      domain,
      signal,
    }: {
      domain: Domain;
      signal?: AbortSignal;
    }) => provisionMailbox(domain, signal),
    onMutate: () => setProvisioning(),
    onSuccess: (mailbox) => {
      addMailbox(mailbox);
      queryClient.removeQueries();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate an inbox. Please try again.";
      setError(message);
    },
  });
}

/**
 * Switches the active mailbox and transparently refreshes its token if the
 * stored JWT no longer works.
 */
export function useSwitchMailbox() {
  const setActive = useMailboxStore((s) => s.setActive);
  const patchMailbox = useMailboxStore((s) => s.patchMailbox);
  const queryClient = useQueryClient();

  return async (id: string) => {
    setActive(id);
    queryClient.removeQueries();
    // Best-effort token validation in the background.
    const mailbox = useMailboxStore.getState().mailboxes.find((m) => m.id === id);
    if (!mailbox) return;
    try {
      const refreshed = await ensureValidToken(mailbox);
      if (refreshed.token !== mailbox.token) {
        patchMailbox(id, { token: refreshed.token });
      }
    } catch {
      /* surfaced by inbox queries on demand */
    }
  };
}

/**
 * Derived, filtered + sorted view of the mailbox list for the sidebar.
 *
 * Supports search, favorite pinning, and newest-first ordering.
 */
export function useFilteredMailboxes(opts?: {
  query?: string;
  sortByNewest?: boolean;
}) {
  const { query = "", sortByNewest = true } = opts ?? {};
  const mailboxes = useMailboxStore((s) => s.mailboxes);

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = mailboxes;
    if (q) {
      list = list.filter(
        (m) =>
          m.address.toLowerCase().includes(q) ||
          (m.label?.toLowerCase().includes(q) ?? false),
      );
    }
    list = [...list].sort((a, b) => {
      if (Boolean(b.favorite) !== Boolean(a.favorite)) {
        return b.favorite ? 1 : -1;
      }
      if (sortByNewest) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });
    return list;
  }, [mailboxes, query, sortByNewest]);
}

/** Exports the current mailboxes as a JSON string (for the settings page). */
export function exportMailboxes(mailboxes: Mailbox[]): string {
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), mailboxes },
    null,
    2,
  );
}

/** Parses + validates an imported JSON payload into Mailbox[]. */
export function parseImportedMailboxes(json: string): Mailbox[] {
  const data = JSON.parse(json) as { mailboxes?: unknown };
  const arr = Array.isArray(data) ? data : data.mailboxes;
  if (!Array.isArray(arr)) {
    throw new Error("Invalid file: expected a mailboxes array.");
  }
  return arr.filter(
    (m): m is Mailbox =>
      Boolean(
        m &&
          typeof m === "object" &&
          m.id &&
          m.address &&
          m.password &&
          m.token &&
          m.createdAt,
      ),
  );
}
