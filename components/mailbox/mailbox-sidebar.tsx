"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { Inbox as InboxIcon, Plus, Search } from "lucide-react";

import { DeleteDialog } from "@/components/mailbox/delete-dialog";
import { MailboxItem } from "@/components/mailbox/mailbox-item";
import { RenameDialog } from "@/components/mailbox/rename-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFilteredMailboxes, useSwitchMailbox } from "@/hooks/use-mailboxes";
import { useProvisionMailbox } from "@/hooks/use-mailboxes";
import { toast } from "@/hooks/use-toast";
import { useMailboxStore } from "@/store/mailbox-store";
import type { Mailbox } from "@/types";

/**
 * Left sidebar: mailbox management.
 *
 * Lists every saved mailbox with search, favorite pinning, newest-first sort,
 * and quick actions (switch / copy / rename / delete). Provisioning a new
 * mailbox happens here too.
 */
export function MailboxSidebar({ className }: { className?: string }) {
  const mailboxes = useMailboxStore((s) => s.mailboxes);
  const activeId = useMailboxStore((s) => s.activeId);
  const renameMailbox = useMailboxStore((s) => s.renameMailbox);
  const removeMailbox = useMailboxStore((s) => s.removeMailbox);
  const toggleFavorite = useMailboxStore((s) => s.toggleFavorite);
  const unreadCount = useMailboxStore((s) => s.unreadCount);

  const switchMailbox = useSwitchMailbox();
  const provision = useProvisionMailbox();

  const [query, setQuery] = React.useState("");
  const [renameTarget, setRenameTarget] = React.useState<Mailbox | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Mailbox | null>(null);

  const filtered = useFilteredMailboxes({ query, sortByNewest: true });

  const handleNew = async () => {
    const controller = new AbortController();
    try {
      const mailbox = await provision.mutateAsync(controller.signal);
      toast({
        title: "New mailbox ready",
        description: mailbox.address,
        variant: "success",
      });
    } catch {
      /* surfaced via store */
    }
  };

  const handleDelete = (id: string) => {
    removeMailbox(id);
    toast({ title: "Mailbox removed", variant: "success" });
  };

  return (
    <aside className={className}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <InboxIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Mailboxes</h2>
            <Badge variant="muted" className="tabular-nums">
              {mailboxes.length}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleNew}
                disabled={provision.isPending}
                size="icon-sm"
                aria-label="New mailbox"
              >
                <Plus
                  className={`h-4 w-4 ${provision.isPending ? "animate-spin" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New mailbox (N)</TooltipContent>
          </Tooltip>
        </div>

        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mailboxes…"
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/[0.02]">
                <InboxIcon className="h-4 w-4 text-muted" />
              </div>
              <p className="text-xs text-muted">
                {query
                  ? "No matching mailboxes."
                  : "No mailboxes yet. Create one to get started."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <AnimatePresence initial={false}>
                {filtered.map((mailbox) => (
                  <MailboxItem
                    key={mailbox.id}
                    mailbox={mailbox}
                    active={mailbox.id === activeId}
                    onSelect={(id) => void switchMailbox(id)}
                    onRename={setRenameTarget}
                    onDelete={setDeleteTarget}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer: unread summary */}
        {unreadCount > 0 && (
          <div className="border-t border-border px-4 py-2.5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Unread in active inbox</span>
              <Badge variant="default" className="tabular-nums">
                {unreadCount}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <RenameDialog
        mailbox={renameTarget}
        open={Boolean(renameTarget)}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        onConfirm={renameMailbox}
      />
      <DeleteDialog
        mailbox={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </aside>
  );
}
