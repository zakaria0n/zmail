"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { EmailCard } from "@/components/email-card";
import { Inbox } from "@/components/inbox/inbox";
import { MessageViewer } from "@/components/message-viewer/message-viewer";
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

  // Provision the first inbox automatically on first visit.
  React.useEffect(() => {
    if (status === "idle" && !account) {
      const controller = new AbortController();
      void provision.mutateAsync(controller.signal).catch(() => {
        /* error already surfaced via store */
      });
      return () => controller.abort();
    }
  }, [status, account, provision]);

  // Re-provision automatically if the session expired (401).
  React.useEffect(() => {
    if (
      status === "ready" &&
      error &&
      /session has expired|expired/i.test(error) &&
      !provision.isPending
    ) {
      const controller = new AbortController();
      void provision.mutateAsync(controller.signal).catch(() => {});
      return () => controller.abort();
    }
  }, [status, error, provision]);

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

      {status === "error" && !account ? (
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
