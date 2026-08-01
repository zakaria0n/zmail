"use client";

/**
 * React Query hooks for the mail.tm inbox.
 *
 * - `useMessages` polls the ACTIVE mailbox's inbox and keeps the unread badge
 *   in sync. On 401 it transparently re-authenticates with the saved password.
 * - `useMessageDetail` lazily fetches a single message's full body.
 * - `useMarkSeen`, `useDeleteMessage` are optimistic mutations.
 *
 * Queries are scoped per-mailbox via the active mailbox id, so switching
 * mailboxes instantly loads that inbox's messages.
 */

import { useEffect, useRef } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { ensureValidToken } from "@/services/account";
import { mailtm } from "@/services/mailtm";
import { useMailboxStore } from "@/store/mailbox-store";
import { useSettingsStore } from "@/store/settings-store";
import type { Message } from "@/types";

/** The active mailbox (id + token), or null while none exists. */
function useActiveMailbox() {
  const activeId = useMailboxStore((s) => s.activeId);
  const mailbox = useMailboxStore((s) =>
    s.mailboxes.find((m) => m.id === s.activeId),
  );
  return { activeId, mailbox: mailbox ?? null };
}

/**
 * Wraps an inbox fetch so a 401 triggers a transparent token refresh:
 * re-authenticate with the saved password, patch the store, then retry once.
 */
async function fetchWithAutoLogin(
  mailboxId: string,
  token: string,
  run: (token: string) => Promise<Message[]>,
): Promise<Message[]> {
  try {
    return await run(token);
  } catch (error) {
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 0;
    if (status !== 401) throw error;

    // Token rejected → refresh from the store and retry once.
    const current = useMailboxStore
      .getState()
      .mailboxes.find((m) => m.id === mailboxId);
    if (!current) throw error;
    const refreshed = await ensureValidToken(current);
    if (refreshed.token !== current.token) {
      useMailboxStore.getState().patchMailbox(mailboxId, {
        token: refreshed.token,
      });
    }
    return await run(refreshed.token);
  }
}

/** Lists all messages for the active mailbox, auto-refreshing. */
export function useMessages() {
  const { activeId, mailbox } = useActiveMailbox();
  const setUnreadCount = useMailboxStore((s) => s.setUnreadCount);
  const autoRefresh = useSettingsStore((s) => s.autoRefreshEnabled);
  const intervalMs = useSettingsStore((s) => s.refreshIntervalMs);

  const query = useQuery({
    queryKey: queryKeys.messages,
    queryFn: async ({ signal }) => {
      if (!mailbox) return [];
      return fetchWithAutoLogin(mailbox.id, mailbox.token, async (token) => {
        const data = await mailtm.getMessages({ token, page: 1 }, signal);
        return data;
      });
    },
    enabled: Boolean(mailbox),
    refetchInterval:
      mailbox && autoRefresh ? intervalMs : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  // Keep the unread badge in the global store in sync.
  const messages = query.data ?? [];
  const unread = messages.filter((m) => !m.seen).length;
  useSyncUnread(unread, setUnreadCount, activeId);

  return {
    ...query,
    messages,
    unreadCount: unread,
  };
}

/** Mirrors the unread count into the global store, resetting on switch. */
function useSyncUnread(
  unread: number,
  setUnreadCount: (n: number) => void,
  activeId: string | null,
) {
  const lastActive = useRef<string | null>(activeId);
  const last = useRef<number>(unread);
  useEffect(() => {
    if (lastActive.current !== activeId) {
      lastActive.current = activeId;
      last.current = unread;
      setUnreadCount(unread);
      return;
    }
    if (last.current !== unread) {
      last.current = unread;
      setUnreadCount(unread);
    }
  }, [unread, setUnreadCount, activeId]);
}

/** Fetches a single message with its HTML / plain-text bodies. */
export function useMessageDetail(id: string | null) {
  const { mailbox } = useActiveMailbox();

  return useQuery({
    queryKey: queryKeys.message(id ?? "none"),
    queryFn: async ({ signal }) => {
      if (!id || !mailbox) {
        throw new Error("No message selected or no active mailbox.");
      }
      try {
        return await mailtm.getMessage({ id, token: mailbox.token }, signal);
      } catch (error) {
        const status =
          error instanceof Error && "status" in error
            ? (error as { status: number }).status
            : 0;
        if (status !== 401) throw error;
        const refreshed = await ensureValidToken(mailbox);
        if (refreshed.token !== mailbox.token) {
          useMailboxStore.getState().patchMailbox(mailbox.id, {
            token: refreshed.token,
          });
        }
        return mailtm.getMessage({ id, token: refreshed.token }, signal);
      }
    },
    enabled: Boolean(id) && Boolean(mailbox),
    staleTime: 30_000,
  });
}

/** Marks a message as seen and updates the cache optimistically. */
export function useMarkSeen() {
  const { mailbox } = useActiveMailbox();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!mailbox) throw new Error("No active mailbox.");
      return mailtm.markMessage({ id, token: mailbox.token, seen: true });
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages });
      const previous = queryClient.getQueryData<Message[]>(queryKeys.messages);
      queryClient.setQueryData<Message[]>(queryKeys.messages, (old) =>
        (old ?? []).map((m) => (m.id === id ? { ...m, seen: true } : m)),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.messages, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages });
    },
  });
}

/** Deletes a message and removes it from the cache optimistically. */
export function useDeleteMessage() {
  const { mailbox } = useActiveMailbox();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!mailbox) throw new Error("No active mailbox.");
      return mailtm.deleteMessage({ id, token: mailbox.token });
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages });
      const previous = queryClient.getQueryData<Message[]>(queryKeys.messages);
      queryClient.setQueryData<Message[]>(queryKeys.messages, (old) =>
        (old ?? []).filter((m) => m.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.messages, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages });
    },
  });
}

/** Marks every currently-unread message as seen. */
export function useMarkAllSeen() {
  const { mailbox } = useActiveMailbox();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messages: Message[]) => {
      if (!mailbox) throw new Error("No active mailbox.");
      return mailtm.markAllSeen({ messages, token: mailbox.token });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages });
    },
  });
}
