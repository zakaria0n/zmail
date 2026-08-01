"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is a temporary email?",
    a: "A temporary (or disposable) email is a short-lived inbox that lets you receive email without revealing your real address. It's perfect for signups, downloads and anything that might send you spam.",
  },
  {
    q: "Is ZMail free to use?",
    a: "Yes — completely. There are no accounts, subscriptions or hidden limits. Generate as many inboxes as you need.",
  },
  {
    q: "How long do messages stay?",
    a: "Inboxes are managed by our mail provider. Messages remain available as long as the underlying mailbox exists; generating a new address replaces the current one.",
  },
  {
    q: "Can I send email from ZMail?",
    a: "No. ZMail is receive-only by design, which keeps it anonymous and prevents abuse. You can read, download and delete incoming mail.",
  },
  {
    q: "Is my data stored?",
    a: "Only the credentials needed to access your temporary inbox are stored locally in your browser so it survives a refresh. We don't run any servers that see your mail.",
  },
] as const;

function FaqItem({
  q,
  a,
  defaultOpen,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground sm:text-base">
          {q}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>
      </motion.div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Questions, answered
        </h2>
      </div>
      <div className="mt-10 flex flex-col gap-3">
        {FAQS.map((faq, i) => (
          <motion.div
            key={faq.q}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <FaqItem {...faq} defaultOpen={i === 0} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
