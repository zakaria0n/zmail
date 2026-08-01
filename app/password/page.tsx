"use client";

import { motion } from "framer-motion";
import { KeyRound, Lock, Sparkles, Zap } from "lucide-react";

import { PasswordGenerator } from "@/components/password-generator/password-generator";

export const dynamic = "force-dynamic";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** /password — the Password Generator page. */
export default function PasswordPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12 sm:pt-16 md:pt-20">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-4 text-center"
      >
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Secure by design
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
        >
          Generate a{" "}
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            strong password
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-xl text-pretty text-base text-muted sm:text-lg"
        >
          Cryptographically-secure passwords generated entirely in your
          browser. Nothing is ever sent anywhere.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted"
        >
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" /> Instant
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-primary" /> 100% local
          </span>
          <span className="inline-flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-primary" /> Up to 64 chars
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10"
      >
        <PasswordGenerator />
      </motion.div>
    </section>
  );
}
