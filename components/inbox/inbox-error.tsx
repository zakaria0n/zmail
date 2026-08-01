"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InboxErrorProps {
  message?: string;
  onRetry: () => void;
}

/** Error-state shown when the inbox fetch fails. */
export function InboxError({ message, onRetry }: InboxErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Couldn&apos;t load your inbox
        </h3>
        <p className="mx-auto max-w-xs text-sm text-muted">
          {message ?? "Something went wrong while fetching messages."}
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
