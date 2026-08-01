"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";

import { OptionToggle } from "@/components/password-generator/option-toggle";
import { StrengthMeter } from "@/components/password-generator/strength-meter";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePasswordGenerator } from "@/hooks/use-password-generator";
import { useCopy } from "@/hooks/use-copy";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * The password generator widget.
 *
 * Shows the generated password with copy/regenerate, a length slider (8–64),
 * character-class toggles, an "exclude ambiguous" option and a live strength
 * meter. Fully self-contained — usable both on its page and as an embed.
 */
export function PasswordGenerator() {
  const { options, password, strength, generate, updateOption } =
    usePasswordGenerator();
  const { copied, copy } = useCopy();

  const handleCopy = async () => {
    const ok = await copy(password);
    if (ok) {
      toast({ title: "Password copied", variant: "success" });
    } else {
      toast({
        title: "Copy failed",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = () => generate();

  return (
    <div className="relative w-full">
      {/* Glow */}
      <div className="absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 opacity-50 blur-2xl" />

      <div className="overflow-hidden rounded-3xl border border-border bg-card/80 p-6 shadow-premium backdrop-blur-xl sm:p-8">
        {/* Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted">
              <KeyRound className="h-4 w-4 text-primary" />
              Generated password
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              ~{strength.entropy} bits of entropy
            </div>
          </div>

          <div className="relative min-h-[3.5rem] rounded-2xl border border-border bg-background/60 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={password}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="break-all font-mono text-lg font-medium leading-relaxed text-foreground sm:text-xl"
              >
                {password || "—"}
              </motion.div>
            </AnimatePresence>
          </div>

          <StrengthMeter result={strength} />

          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={handleCopy} className="gap-2" size="lg">
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
                  onClick={handleRegenerate}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a new password</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Length slider */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="pw-length"
              className="text-sm font-medium text-foreground"
            >
              Length
            </label>
            <span className="flex h-7 w-12 items-center justify-center rounded-lg border border-border bg-white/[0.03] font-mono text-sm font-semibold text-primary tabular-nums">
              {options.length}
            </span>
          </div>
          <input
            id="pw-length"
            type="range"
            min={8}
            max={64}
            step={1}
            value={options.length}
            onChange={(e) => updateOption("length", Number(e.target.value))}
            className={cn(
              "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none",
              "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
              "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary",
            )}
          />
          <div className="flex justify-between text-[10px] text-muted">
            <span>8</span>
            <span>16</span>
            <span>24</span>
            <span>32</span>
            <span>48</span>
            <span>64</span>
          </div>
        </div>

        {/* Options */}
        <div className="mt-8 space-y-2.5">
          <p className="text-sm font-medium text-foreground">Characters</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <OptionToggle
              label="Uppercase"
              description="A–Z"
              icon="Aa"
              checked={options.uppercase}
              onCheckedChange={(v) => updateOption("uppercase", v)}
            />
            <OptionToggle
              label="Lowercase"
              description="a–z"
              icon="aa"
              checked={options.lowercase}
              onCheckedChange={(v) => updateOption("lowercase", v)}
            />
            <OptionToggle
              label="Numbers"
              description="0–9"
              icon="09"
              checked={options.numbers}
              onCheckedChange={(v) => updateOption("numbers", v)}
            />
            <OptionToggle
              label="Symbols"
              description="!@#$…"
              icon="#$"
              checked={options.symbols}
              onCheckedChange={(v) => updateOption("symbols", v)}
            />
          </div>
          <OptionToggle
            label="Exclude ambiguous"
            description="Skip 0/O, 1/l/I and similar look-alikes"
            checked={options.excludeAmbiguous}
            onCheckedChange={(v) => updateOption("excludeAmbiguous", v)}
          />
        </div>
      </div>
    </div>
  );
}
