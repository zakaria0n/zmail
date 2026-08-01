"use client";

import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { contactLabel, initials, timeAgo, truncate } from "@/utils/format";

interface MessageListItemProps {
  message: Message;
  active?: boolean;
  onSelect: (message: Message) => void;
}

/** A single row in the inbox list. */
export function MessageListItem({
  message,
  active,
  onSelect,
}: MessageListItemProps) {
  const from = contactLabel(message.from.name, message.from.address);
  const subject = message.subject?.trim() || "(no subject)";

  return (
    <motion.button
      type="button"
      layout
      onClick={() => onSelect(message)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ x: 2 }}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-primary/40 bg-primary/[0.06]"
          : "border-transparent bg-white/[0.02] hover:border-border hover:bg-white/[0.04]",
      )}
    >
      {/* Unread indicator */}
      {!message.seen && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary"
        />
      )}

      {/* Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          message.seen
            ? "bg-white/5 text-muted"
            : "bg-primary/15 text-primary",
        )}
      >
        {initials(message.from.name, message.from.address)}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              message.seen
                ? "font-medium text-foreground/80"
                : "font-semibold text-foreground",
            )}
          >
            {truncate(from, 28)}
          </span>
          <span className="shrink-0 text-[11px] text-muted">
            {timeAgo(message.createdAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-sm",
              message.seen ? "text-muted" : "text-foreground/90",
            )}
          >
            {truncate(subject, 44)}
          </span>
          {message.hasAttachments && (
            <Paperclip className="h-3 w-3 shrink-0 text-muted" />
          )}
        </div>
        {message.intro && (
          <p className="mt-0.5 truncate text-xs text-muted">
            {truncate(message.intro, 60)}
          </p>
        )}
      </div>

      {!message.seen && (
        <Badge variant="default" className="absolute right-2 top-2 px-1.5 py-0">
          new
        </Badge>
      )}
    </motion.button>
  );
}
