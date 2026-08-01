"use client";

import { motion } from "framer-motion";

import { STRENGTH_META } from "@/utils/password";
import type { PasswordStrengthResult } from "@/types";
import { cn } from "@/lib/utils";

/** 4-segment strength bar + label, animated on change. */
export function StrengthMeter({ result }: { result: PasswordStrengthResult }) {
  const meta = STRENGTH_META[result.strength];
  // Number of filled segments (1–4) for weak → very-strong.
  const filled =
    result.strength === "weak"
      ? 1
      : result.strength === "medium"
        ? 2
        : result.strength === "strong"
          ? 3
          : 4;

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              opacity: i < filled ? 1 : 0.18,
              scaleX: i < filled ? 1 : 0.96,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < filled ? meta.bar : "bg-white/10",
            )}
          />
        ))}
      </div>
      <div className="flex w-28 shrink-0 items-center justify-end gap-1.5">
        <span className={cn("text-xs font-medium tabular-nums", meta.color)}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}
