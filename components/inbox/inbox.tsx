"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { CheckCheck, Mailbox, RefreshCw } from "lucide-react";

import { InboxEmpty } from "@/components/inbox/inbox-empty";
import { InboxError } from "@/components/inbox/inbox-error";
import { InboxSkeleton } from "@/components/inbox/inbox-skeleton";
import { MessageListItem } from "@/components/inbox/message-list-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMessages } from "@/hooks/use-messages";
import { useMarkAllSeen } from "@/hooks/use-messages";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/types";

interface InboxProps {
  selectedId: string | null;
  onSelect: (message: Message) => void;
}

/**
 * Inbox panel: header (count + unread badge), auto-refreshing message list,
 * and the loading / empty / error states.
 */
export function Inbox({ selectedId, onSelect }: InboxProps) {
  const { messages, isLoading, isError, error, isFetching, refetch } =
    useMessages();
  const markAll = useMarkAllSeen();

  const unread = messages.filter((m) => !m.seen).length;
  const isInitialLoading = isLoading && messages.length === 0;

  const handleMarkAll = async () => {
    if (unread === 0) return;
    try {
      await markAll.mutateAsync(messages);
      toast({ title: "All caught up", description: "Marked everything as read.", variant: "success" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Mailbox className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
          <Badge variant="muted" className="tabular-nums">
            {messages.length}
          </Badge>
          {unread > 0 && (
            <Badge variant="default" className="tabular-nums">
              {unread} unread
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unread > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleMarkAll}
                  variant="ghost"
                  size="icon-sm"
                  disabled={markAll.isPending}
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark all as read</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="icon-sm"
                aria-label="Refresh inbox"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh (R)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isInitialLoading ? (
          <InboxSkeleton count={4} />
        ) : isError ? (
          <InboxError
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
          />
        ) : messages.length === 0 ? (
          <InboxEmpty />
        ) : (
          <div className="flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MessageListItem
                  key={message.id}
                  message={message}
                  active={message.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
