/**
 * React Query hooks for the mail.tm inbox.
 *
 * - `useMessages` polls the inbox every 10s and keeps the unread badge in sync.
 * - `useMessageDetail` lazily fetches a single message's full body.
 * - `useMarkSeen`, `useDeleteMessage`, `useDeleteAccount` are mutations that
 *   keep the cache consistent.
 */

import { useEffect, useRef } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { siteConfig } from "@/config/site";
import { queryKeys } from "@/hooks/query-keys";
import { mailtm } from "@/services/mailtm";
import { useAccountStore } from "@/store/account-store";
import type { Message } from "@/types";

/**
 * Reads the current token from the store.
 *
 * Returns `null` when no account exists yet (instead of throwing) so the
 * hooks can be safely rendered during SSR / before provisioning. The actual
 * network calls are gated behind `enabled`.
 */
function useToken(): string | null {
  return useAccountStore((s) => s.account?.token ?? null);
}

/** Lists all messages for the active inbox, auto-refreshing every 10s. */
export function useMessages() {
  const token = useToken();
  const setUnreadCount = useAccountStore((s) => s.setUnreadCount);

  const query = useQuery({
    queryKey: queryKeys.messages,
    queryFn: async ({ signal }) => {
      if (!token) return [];
      const data = await mailtm.getMessages({ token, page: 1 }, signal);
      return data["hydra:member"] ?? [];
    },
    enabled: Boolean(token),
    refetchInterval: token ? siteConfig.inboxRefreshIntervalMs : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  // Keep the unread badge in the global store in sync.
  const messages = query.data ?? [];
  const unread = messages.filter((m) => !m.seen).length;
  useSyncUnread(unread, setUnreadCount);

  return {
    ...query,
    messages,
    unreadCount: unread,
  };
}

/**
 * Mirrors the unread count into the global store via an effect, so the
 * header/badge always reflects the latest inbox state.
 */
function useSyncUnread(unread: number, setUnreadCount: (n: number) => void) {
  const last = useRef<number>(unread);
  useEffect(() => {
    if (last.current !== unread) {
      last.current = unread;
      setUnreadCount(unread);
    }
  }, [unread, setUnreadCount]);
}

/** Fetches a single message with its HTML / plain-text bodies. */
export function useMessageDetail(id: string | null) {
  const token = useToken();

  return useQuery({
    queryKey: queryKeys.message(id ?? "none"),
    queryFn: async ({ signal }) => {
      if (!id || !token) {
        throw new Error("No message selected or no active inbox.");
      }
      return mailtm.getMessage({ id, token }, signal);
    },
    enabled: Boolean(id) && Boolean(token),
    staleTime: 30_000,
  });
}

/** Marks a message as seen and updates the cache. */
export function useMarkSeen() {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No active inbox.");
      return mailtm.markMessage({ id, token, seen: true });
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

/** Deletes a message and removes it from the cache. */
export function useDeleteMessage() {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No active inbox.");
      return mailtm.deleteMessage({ id, token });
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
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messages: Message[]) => {
      if (!token) throw new Error("No active inbox.");
      return mailtm.markAllSeen({ messages, token });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages });
    },
  });
}
