"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  KeyRound,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCopy } from "@/hooks/use-copy";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Mailbox } from "@/types";
import { initials, timeAgo, truncate } from "@/utils/format";

interface MailboxItemProps {
  mailbox: Mailbox;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (mailbox: Mailbox) => void;
  onDelete: (mailbox: Mailbox) => void;
  onToggleFavorite: (id: string) => void;
}

/** A single mailbox row in the sidebar list. */
export function MailboxItem({
  mailbox,
  active,
  onSelect,
  onRename,
  onDelete,
  onToggleFavorite,
}: MailboxItemProps) {
  const { copied, copy } = useCopy();
  const [copiedWhat, setCopiedWhat] = React.useState<null | "address" | "password">(
    null,
  );

  const handleCopy = async (
    value: string,
    kind: "address" | "password",
    label: string,
  ) => {
    const ok = await copy(value);
    if (ok) {
      setCopiedWhat(kind);
      toast({ title: `${label} copied`, variant: "success" });
      window.setTimeout(() => setCopiedWhat(null), 1500);
    } else {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors",
        active
          ? "border-primary/40 bg-primary/[0.07]"
          : "border-transparent hover:border-border hover:bg-white/[0.04]",
      )}
    >
      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      {/* Avatar */}
      <button
        type="button"
        onClick={() => onSelect(mailbox.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            active ? "bg-primary/15 text-primary" : "bg-white/5 text-muted",
          )}
        >
          {initials(mailbox.label, mailbox.address)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "truncate text-sm",
                active ? "font-semibold text-foreground" : "font-medium text-foreground/85",
              )}
            >
              {mailbox.label || truncate(mailbox.address.split("@")[0]!, 18)}
            </span>
            {mailbox.favorite && (
              <Star className="h-3 w-3 shrink-0 fill-secondary text-secondary" />
            )}
          </span>
          <span className="block truncate font-mono text-[11px] text-muted">
            {truncate(mailbox.address, 24)}
          </span>
        </span>
      </button>

      <span className="shrink-0 text-[10px] text-muted">
        {timeAgo(mailbox.createdAt)}
      </span>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-60 transition-opacity hover:bg-white/5 hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Mailbox options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => onSelect(mailbox.id)}>
            <Check className="h-4 w-4" /> Switch to inbox
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleCopy(mailbox.address, "address", "Address")}
          >
            {copiedWhat === "address" ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleCopy(mailbox.password, "password", "Password")}
          >
            {copiedWhat === "password" ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Copy password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleFavorite(mailbox.id)}>
            <Star
              className={cn(
                "h-4 w-4",
                mailbox.favorite && "fill-secondary text-secondary",
              )}
            />
            {mailbox.favorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onRename(mailbox)}>
            <Pencil className="h-4 w-4" /> Rename label
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(mailbox)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!active && copied ? (
        <Badge variant="default" className="absolute right-2 top-1">
          <Check className="h-3 w-3" />
        </Badge>
      ) : null}
    </motion.div>
  );
}
