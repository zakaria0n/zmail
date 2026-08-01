"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { EmailCard } from "@/components/email-card";
import { Inbox } from "@/components/inbox/inbox";
import { MailboxSidebar } from "@/components/mailbox/mailbox-sidebar";
import { MessageViewer } from "@/components/message-viewer/message-viewer";
import { Button } from "@/components/ui/button";
import { ProvisioningState } from "@/components/provisioning-state";
import { useProvisionMailbox } from "@/hooks/use-mailboxes";
import { useMessages } from "@/hooks/use-messages";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { toast } from "@/hooks/use-toast";
import { useCopy } from "@/hooks/use-copy";
import { useSelectionStore } from "@/components/mobile-selection-bridge";
import { useMailboxStore } from "@/store/mailbox-store";
import type { Message } from "@/types";

/**
 * The main interactive workspace.
 *
 * Three-column layout on desktop:
 *   [mailbox sidebar] · [email card + inbox/viewer]
 *
 * Owns selection state, keyboard shortcuts and first-visit provisioning.
 */
export function Workspace() {
  const mailboxes = useMailboxStore((s) => s.mailboxes);
  const activeMailbox = useMailboxStore((s) =>
    s.mailboxes.find((m) => m.id === s.activeId),
  );
  const status = useMailboxStore((s) => s.status);
  const error = useMailboxStore((s) => s.error);

  const provision = useProvisionMailbox();
  const queryClient = useQueryClient();
  const { isFetching, refetch } = useMessages();
  const { copy } = useCopy();

  const selectedId = useSelectionStore((s) => s.selectedId);
  const setSelectedId = useSelectionStore((s) => s.setSelectedId);
  const addressRef = React.useRef<HTMLElement | null>(null);

  // Auto-provision the very first mailbox on mount, with a capped retry loop.
  React.useEffect(() => {
    if (mailboxes.length > 0) return;
    const controller = new AbortController();
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tryProvision = async () => {
      attempts += 1;
      try {
        await provision.mutateAsync(controller.signal);
      } catch {
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

  const handleGenerateNew = async () => {
    setSelectedId(null);
    const controller = new AbortController();
    try {
      const next = await provision.mutateAsync(controller.signal);
      toast({
        title: "New mailbox ready",
        description: next.address,
        variant: "success",
      });
    } catch {
      /* surfaced via store */
    }
  };

  const handleRefresh = () => {
    void refetch();
    void queryClient.invalidateQueries();
  };

  const handleSelect = (message: Message) => setSelectedId(message.id);
  const handleBack = () => setSelectedId(null);

  // Keyboard shortcuts.
  useKeyboardShortcuts(
    {
      n: (e) => {
        e.preventDefault();
        void handleGenerateNew();
      },
      r: (e) => {
        e.preventDefault();
        handleRefresh();
      },
      "/": (e) => {
        e.preventDefault();
        addressRef.current?.focus();
      },
    },
    true,
  );

  // Cmd/Ctrl+C copies the active address (Shift variant copies password),
  // but only when the user hasn't selected text (so normal copy still works).
  React.useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "c") return;
      const selection = window.getSelection?.()?.toString() ?? "";
      if (selection.length > 0) return; // let the native copy win
      const mailbox = useMailboxStore.getState().mailboxes.find(
        (m) => m.id === useMailboxStore.getState().activeId,
      );
      if (!mailbox) return;
      e.preventDefault();
      if (e.shiftKey) {
        if (await copy(mailbox.password))
          toast({ title: "Password copied", variant: "success" });
      } else {
        if (await copy(mailbox.address))
          toast({ title: "Address copied", variant: "success" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [copy]);

  const isProvisioning = provision.isPending || status === "provisioning";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
      {/* Sidebar (desktop) */}
      <div className="hidden h-[80vh] overflow-hidden rounded-2xl border border-border bg-card/40 shadow-card backdrop-blur-xl lg:block">
        <MailboxSidebar className="h-full" />
      </div>

      {/* Main column */}
      <div className="flex flex-col gap-6">
        <EmailCard
          address={activeMailbox?.address ?? null}
          isProvisioning={isProvisioning}
          isRefreshing={isFetching}
          onRefresh={handleRefresh}
          onGenerate={handleGenerateNew}
          registerAddressRef={(el) => {
            addressRef.current = el;
          }}
        />

        {status === "error" && mailboxes.length === 0 && !provision.isPending ? (
          <ProvisionErrorState
            message={error ?? undefined}
            onRetry={() => {
              const controller = new AbortController();
              void provision.mutateAsync(controller.signal).catch(() => {});
            }}
          />
        ) : mailboxes.length === 0 ? (
          <ProvisioningState />
        ) : !activeMailbox ? (
          <ProvisioningState />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            {/* Inbox */}
            <div className="h-[64vh] overflow-hidden rounded-2xl border border-border bg-card/40 shadow-card backdrop-blur-xl xl:h-[66vh]">
              <Inbox selectedId={selectedId} onSelect={handleSelect} />
            </div>

            {/* Viewer (desktop side panel) */}
            <div className="hidden h-[66vh] overflow-hidden rounded-2xl border border-border bg-card/40 shadow-card backdrop-blur-xl xl:block">
              <MessageViewer messageId={selectedId} onBack={handleBack} />
            </div>
          </div>
        )}
      </div>
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
          Couldn&apos;t generate a mailbox
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
