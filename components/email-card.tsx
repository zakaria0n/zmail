"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Mail, Plus, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopy } from "@/hooks/use-copy";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EmailCardProps {
  address: string | null;
  isProvisioning: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onGenerate: () => void;
  /** Optional ref callback for the address element (used by "/" shortcut). */
  registerAddressRef?: (el: HTMLElement | null) => void;
}

/**
 * The hero "your temporary email" card.
 *
 * Shows the current inbox address with copy / refresh / generate controls.
 * Handles all four states: provisioning, ready, refreshing, and a shimmer
 * skeleton while the first address resolves.
 */
export function EmailCard({
  address,
  isProvisioning,
  isRefreshing,
  onRefresh,
  onGenerate,
  registerAddressRef,
}: EmailCardProps) {
  const { copied, copy } = useCopy();

  const handleCopy = async () => {
    if (!address) return;
    const ok = await copy(address);
    if (ok) {
      toast({ title: "Address copied", description: address, variant: "success" });
    } else {
      toast({
        title: "Copy failed",
        description: "Couldn't access the clipboard. Try selecting manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Outer glow */}
      <div className="absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40 opacity-60 blur-2xl" />

      <div className="overflow-hidden rounded-3xl border border-border bg-card/80 shadow-premium backdrop-blur-xl">
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          {/* Label row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted">
              <Mail className="h-4 w-4 text-primary" />
              Your temporary email
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Private & disposable
            </div>
          </div>

          {/* Address display */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isProvisioning && !address ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-full max-w-md rounded-lg">
                    <div className="h-full w-full animate-pulse rounded-lg bg-white/5" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2"
                >
                  <h2
                    ref={registerAddressRef}
                    tabIndex={0}
                    className={cn(
                      "min-w-0 select-all truncate font-mono text-xl font-medium tracking-tight text-foreground sm:text-2xl",
                    )}
                    title={address ?? undefined}
                  >
                    {address ?? "Generating…"}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleCopy}
              disabled={!address || isProvisioning}
              className="gap-2"
              size="lg"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onRefresh}
                  disabled={isRefreshing || isProvisioning}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      isRefreshing && "animate-spin",
                    )}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                  <kbd className="ml-1 hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted lg:inline">
                    R
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh inbox (R)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onGenerate}
                  disabled={isProvisioning}
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New email</span>
                  <kbd className="ml-1 hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted lg:inline">
                    N
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a new inbox (N)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
