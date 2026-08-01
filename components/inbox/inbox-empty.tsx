"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

/** Empty-state shown when the inbox has no messages yet. */
export function InboxEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/20 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card/60">
          <Inbox className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Your inbox is empty
        </h3>
        <p className="mx-auto max-w-xs text-sm text-muted">
          Waiting for incoming mail… Use your address anywhere and messages
          will appear here automatically.
        </p>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Auto-refreshing every 10s
      </div>
    </motion.div>
  );
}
