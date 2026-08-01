"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Code,
  Download,
  Eye,
  FileText,
  MailOpen,
  Trash2,
} from "lucide-react";

import { MessageHtmlFrame } from "@/components/message-viewer/message-html-frame";
import { MessageSkeleton } from "@/components/message-viewer/message-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteMessage, useMarkSeen, useMessageDetail } from "@/hooks/use-messages";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { MessageDetail } from "@/types";
import { contactLabel, formatDateTime, initials, timeAgo } from "@/utils/format";
import { downloadHtml, downloadText, slugifySubject } from "@/utils/download";

interface MessageViewerProps {
  messageId: string | null;
  onBack: () => void;
}

type ViewMode = "html" | "text";

/**
 * The message detail pane.
 *
 * Fetches the full message body, marks it seen on first view, and offers
 * HTML / plain-text rendering, download and delete.
 */
export function MessageViewer({ messageId, onBack }: MessageViewerProps) {
  const { data: message, isLoading, isError, error } = useMessageDetail(messageId);
  const markSeen = useMarkSeen();
  const deleteMessage = useDeleteMessage();
  const [mode, setMode] = React.useState<ViewMode>("html");

  // Mark as seen once the detail loads and it's still unread.
  React.useEffect(() => {
    if (message && !message.seen && messageId) {
      markSeen.mutate(messageId);
    }
  }, [message, messageId, markSeen]);

  const handleDelete = async () => {
    if (!messageId) return;
    try {
      await deleteMessage.mutateAsync(messageId);
      toast({ title: "Message deleted", variant: "success" });
      onBack();
    } catch {
      toast({ title: "Failed to delete message", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (!message) return;
    const slug = slugifySubject(message.subject);
    if (mode === "html") {
      const doc = message.html?.join("\n") ?? "";
      downloadHtml(`${slug}.html`, doc || message.text || "");
      toast({ title: "Downloaded HTML", variant: "success" });
    } else {
      downloadText(`${slug}.txt`, message.text || message.intro || "");
      toast({ title: "Downloaded text", variant: "success" });
    }
  };

  if (!messageId) {
    return <MessageEmptyState />;
  }

  if (isLoading) {
    return <MessageSkeleton />;
  }

  if (isError || !message) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10">
          <MailOpen className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Couldn&apos;t open this message
        </h3>
        <p className="max-w-xs text-sm text-muted">
          {error instanceof Error ? error.message : "It may have been deleted."}
        </p>
        <Button onClick={onBack} variant="outline" size="sm">
          Back to inbox
        </Button>
      </div>
    );
  }

  const hasHtml = Boolean(message.html && message.html.length > 0);
  const effectiveMode: ViewMode = hasHtml ? mode : "text";

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full min-h-0 flex-col"
    >
      <MessageHeader
        message={message}
        onBack={onBack}
        onDelete={handleDelete}
        isDeleting={deleteMessage.isPending}
      />

      <MessageToolbar
        mode={effectiveMode}
        hasHtml={hasHtml}
        onModeChange={setMode}
        onDownload={handleDownload}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {effectiveMode === "html" && hasHtml ? (
          <MessageHtmlFrame html={message.html!.join("\n")} />
        ) : (
          <PlainTextBody text={message.text || message.intro} />
        )}
      </div>
    </motion.div>
  );
}

/** Sticky header with sender, subject and metadata. */
function MessageHeader({
  message,
  onBack,
  onDelete,
  isDeleting,
}: {
  message: MessageDetail;
  onBack: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const from = contactLabel(message.from.name, message.from.address);
  return (
    <div className="border-b border-border p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onDelete}
              disabled={isDeleting}
              variant="ghost"
              size="icon-sm"
              className="text-muted hover:text-destructive"
              aria-label="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete (⌫)</TooltipContent>
        </Tooltip>
      </div>

      <h1 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
        {message.subject?.trim() || "(no subject)"}
      </h1>

      <div className="mt-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {initials(message.from.name, message.from.address)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-foreground">{from}</span>
            {!message.seen && <Badge variant="default">new</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="truncate">to {message.to.map((t) => t.address).join(", ")}</span>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
              <Clock className="h-3 w-3" />
              {timeAgo(message.createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{formatDateTime(message.createdAt)}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

/** HTML / Text toggle + download button. */
function MessageToolbar({
  mode,
  hasHtml,
  onModeChange,
  onDownload,
}: {
  mode: ViewMode;
  hasHtml: boolean;
  onModeChange: (mode: ViewMode) => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5 sm:px-6">
      <div className="inline-flex items-center rounded-lg border border-border bg-white/[0.02] p-0.5">
        <ToggleButton active={mode === "html"} onClick={() => onModeChange("html")} disabled={!hasHtml}>
          <Eye className="h-3.5 w-3.5" />
          HTML
        </ToggleButton>
        <ToggleButton active={mode === "text"} onClick={() => onModeChange("text")}>
          <Code className="h-3.5 w-3.5" />
          Text
        </ToggleButton>
      </div>
      <Button onClick={onDownload} variant="outline" size="sm" className="gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
    </div>
  );
}

function ToggleButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PlainTextBody({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-4">
      {text ? (
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
          {text}
        </pre>
      ) : (
        <div className="flex items-center gap-2 py-6 text-sm text-muted">
          <FileText className="h-4 w-4" />
          This message has no plain-text body.
        </div>
      )}
    </div>
  );
}

/** Placeholder shown when no message is selected. */
function MessageEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/20 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card/60">
          <MailOpen className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Select a message
        </h3>
        <p className="mx-auto max-w-xs text-sm text-muted">
          Choose an email from the inbox to read its contents here.
        </p>
      </div>
    </div>
  );
}
