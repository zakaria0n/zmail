"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SettingsRowProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Right-aligned control slot (switch, select…). */
  control: React.ReactNode;
  className?: string;
}

/** A single labeled settings row: title/description on the left, control right. */
export function SettingsRow({
  title,
  description,
  children,
  control,
  className,
}: SettingsRowProps) {
  return (
    <motion.div
      layout
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-border bg-white/[0.02] p-4",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description ? (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        ) : null}
        {children}
      </div>
      <div className="shrink-0">{control}</div>
    </motion.div>
  );
}
