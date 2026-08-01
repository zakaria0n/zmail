"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/** Full-area spinner shown while the first inbox is being provisioned. */
export function ProvisioningState({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/40 px-6 py-12 text-center backdrop-blur-xl"
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {message ?? "Preparing your inbox"}
        </p>
        <p className="text-xs text-muted">Generating a private address…</p>
      </div>
    </motion.div>
  );
}
