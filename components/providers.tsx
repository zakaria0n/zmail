"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useMailboxStore } from "@/store/mailbox-store";
import { useSettingsStore } from "@/store/settings-store";

/** Stable, memoized QueryClient for the whole app. */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 10_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/**
 * Root client provider.
 *
 * Wires React Query, Radix tooltips, the toast viewport and hydrates the
 * persisted mailboxes + settings from localStorage on first mount.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const hydrateMailboxes = useMailboxStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  React.useEffect(() => {
    hydrateSettings();
    // Prune mailboxes older than 7 days using the settings flag.
    const { pruneExpiredEnabled } = useSettingsStore.getState();
    hydrateMailboxes(pruneExpiredEnabled);
  }, [hydrateMailboxes, hydrateSettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
