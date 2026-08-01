"use client";

import { motion } from "framer-motion";
import { ClipboardCopy, MailCheck, MousePointerClick } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    step: "01",
    title: "We generate your inbox",
    description:
      "The moment you arrive, ZMail provisions a fresh, anonymous email address for you.",
  },
  {
    icon: ClipboardCopy,
    step: "02",
    title: "Copy & use it anywhere",
    description:
      "Copy the address with one click and use it on any signup, form or download page.",
  },
  {
    icon: MailCheck,
    step: "03",
    title: "Receive mail instantly",
    description:
      "Incoming emails appear here automatically — no refresh button needed.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-4 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Three steps to a cleaner inbox
        </h2>
      </div>

      <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* connecting line */}
        <div className="absolute left-0 right-0 top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur-xl">
              <step.icon className="h-6 w-6 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-glow">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
