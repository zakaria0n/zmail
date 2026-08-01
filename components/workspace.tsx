"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { EmailCard } from "@/components/email-card";
import { Inbox } from "@/components/inbox/inbox";
import { MessageViewer } from "@/components/message-viewer/message-viewer";
import { Button } from "@/components/ui/button";
import { ProvisioningState } from "@/components/provisioning-state";
import { useGenerateNewAccount, useProvisionAccount } from "@/hooks/use-account";
import { useMessages } from "@/hooks/use-messages";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { toast } from "@/hooks/use-toast";
import { useSelectionStore } from "@/components/mobile-selection-bridge";
import { useAccountStore } from "@/store/account-store";
import type { Message } from "@/types";

/**
 * The main interactive workspace.
 *
 * Owns the selected-message state and wires together the email card, inbox
 * and message viewer. Also provisions the very first inbox on mount and binds
 * the global keyboard shortcuts.
 */
export function Workspace() {
  const account = useAccountStore((s) => s.account);
  const status = useAccountStore((s) => s.status);
  const error = useAccountStore((s) => s.error);

  const provision = useProvisionAccount();
  const generateNew = useGenerateNewAccount();
  const queryClient = useQueryClient();

  // Pull `isFetching` for the inbox to drive the refresh spinner.
  const { isFetching, refetch } = useMessages();

  const selectedId = useSelectionStore((s) => s.selectedId);
  const setSelectedId = useSelectionStore((s) => s.setSelectedId);
  const addressRef = React.useRef<HTMLElement | null>(null);

  // Stable reference to the mutate function so provisioning effects don't
  // re-fire every render (the mutation object changes identity each render).
  const provisionMutate = React.useCallback(
    (signal: AbortSignal) =>
      provision.mutateAsync(signal).catch(() => {
        /* error surfaced via store */
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Auto-provision the first inbox on mount, with a capped retry-on-failure
  // loop so a transient mail.tm error doesn't leave the user stuck on
  // "Generating…" forever. Runs once; subsequent retries are scheduled inside.
  React.useEffect(() => {
    if (account) return;
    const controller = new AbortController();
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tryProvision = async () => {
      attempts += 1;
      try {
        await provisionMutate(controller.signal);
      } catch {
        // Schedule a backoff retry (cap at 4 attempts) so the UI isn't stuck.
        if (attempts < 4 && !controller.signal.aborted) {
          timer = setTimeout(tryProvision, 1500 * attempts);
        }
      }
    };

    void tryProvision();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-provision automatically if the session expired (401).
  React.useEffect(() => {
    if (
      status === "ready" &&
      error &&
      /session has expired|expired/i.test(error) &&
      !provision.isPending
    ) {
      const controller = new AbortController();
      provisionMutate(controller.signal);
      return () => controller.abort();
    }
  }, [status, error, provision.isPending, provisionMutate]);

  const handleGenerateNew = async () => {
    setSelectedId(null);
    const controller = new AbortController();
    try {
      const next = await generateNew.mutateAsync(controller.signal);
      toast({
        title: "New inbox ready",
        description: next.address,
        variant: "success",
      });
    } catch {
      /* handled in store */
    }
  };

  const handleRefresh = () => {
    void refetch();
    void queryClient.invalidateQueries();
  };

  const handleSelect = (message: Message) => {
    setSelectedId(message.id);
  };

  const handleBack = () => setSelectedId(null);

  useKeyboardShortcuts(
    {
      r: (e) => {
        e.preventDefault();
        handleRefresh();
      },
      n: (e) => {
        e.preventDefault();
        void handleGenerateNew();
      },
      "/": (e) => {
        e.preventDefault();
        addressRef.current?.focus();
      },
    },
    status === "ready",
  );

  const isProvisioning = provision.isPending || status === "provisioning";

  // Manual retry exposed when auto-provisioning ultimately fails.
  const handleRetryProvision = () => {
    const controller = new AbortController();
    void provision.mutateAsync(controller.signal).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-6">
      <EmailCard
        address={account?.address ?? null}
        isProvisioning={isProvisioning}
        isRefreshing={isFetching}
        onRefresh={handleRefresh}
        onGenerate={handleGenerateNew}
        registerAddressRef={(el) => {
          addressRef.current = el;
        }}
      />

      {status === "error" && !account && !provision.isPending ? (
        <ProvisionErrorState
          message={error ?? undefined}
          onRetry={handleRetryProvision}
        />
      ) : status === "error" && !account ? (
        <ProvisioningState message="Retrying…" />
      ) : !account ? (
        <ProvisioningState />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* Inbox */}
          <div className="h-[70vh] overflow-hidden rounded-2xl border border-border bg-card/40 shadow-card backdrop-blur-xl lg:h-[72vh]">
            <Inbox selectedId={selectedId} onSelect={handleSelect} />
          </div>

          {/* Viewer (desktop side panel) */}
          <div className="hidden h-[72vh] overflow-hidden rounded-2xl border border-border bg-card/40 shadow-card backdrop-blur-xl lg:block">
            <MessageViewer messageId={selectedId} onBack={handleBack} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Error state with a manual retry button, shown when provisioning fails. */
function ProvisionErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-card/40 px-6 py-12 text-center backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-destructive"
          aria-hidden="true"
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          Couldn&apos;t generate an inbox
        </p>
        <p className="mx-auto max-w-xs text-xs text-muted">
          {message ?? "mail.tm is busy right now. Please try again."}
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm">
        Try again
      </Button>
    </div>
  );
}
