"use client";

import { motion } from "framer-motion";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface OptionToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

/** A labeled row with a switch, used for password character-class options. */
export function OptionToggle({
  label,
  description,
  checked,
  onCheckedChange,
  icon,
}: OptionToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
        checked
          ? "border-primary/30 bg-primary/[0.06]"
          : "border-border bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            checked
              ? "bg-primary/15 text-primary"
              : "bg-white/5 text-muted",
          )}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description ? (
          <div className="text-xs text-muted">{description}</div>
        ) : null}
      </div>
      <motion.div layout>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </motion.div>
    </button>
  );
}
