"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Github, Star } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

/** Sticky, glassy top navigation. */
export function Header() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between rounded-2xl border border-border bg-card/60 px-4 shadow-card backdrop-blur-xl">
          <Logo />

          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="transition-colors hover:text-foreground"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              <motion.div
                key="badge"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:block"
              >
                <Badge variant="default" className="gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Live
                </Badge>
              </motion.div>
            </AnimatePresence>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Star on GitHub</span>
                <span className="sm:hidden">Star</span>
                <Star className="h-3 w-3 fill-current text-secondary" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
