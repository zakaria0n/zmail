"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Headline, subheadline and trust badges above the email card. */
export function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-4 text-center"
    >
      <motion.div variants={item}>
        <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary">No signup. No tracking.</span>
        </Badge>
      </motion.div>

      <motion.h1
        variants={item}
        className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl"
      >
        Disposable email,
        <br />
        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          reimagined.
        </span>
      </motion.h1>

      <motion.p
        variants={item}
        className="max-w-xl text-pretty text-base text-muted sm:text-lg"
      >
        Get an instant, anonymous inbox to protect your real address from spam.
        Generate, copy, and receive emails in seconds — entirely free.
      </motion.p>

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted"
      >
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-primary" /> Instant inbox
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" /> 100% private
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" /> Always free
        </span>
      </motion.div>
    </motion.div>
  );
}
