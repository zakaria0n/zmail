"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Keyboard,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant generation",
    description:
      "A brand-new inbox the moment you land. No forms, no waiting — just a working address.",
  },
  {
    icon: RefreshCw,
    title: "Live auto-refresh",
    description:
      "New mail arrives automatically every few seconds. We poll so you don't have to.",
  },
  {
    icon: Bell,
    title: "Unread badges",
    description:
      "A clear unread count keeps you on top of incoming messages at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Disposable addresses keep your real inbox away from spam, leaks and trackers.",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcuts",
    description:
      "Power through your inbox with R to refresh, N for new mail, J/K to navigate.",
  },
  {
    icon: Smartphone,
    title: "Beautiful on mobile",
    description:
      "A responsive, glassy interface that feels great on every screen size.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Features
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="mt-4 text-muted">
          Built for speed and privacy with a premium, distraction-free interface.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-xl transition-colors hover:border-primary/30 hover:bg-card/60"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
