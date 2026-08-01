"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Github, KeyRound, Settings, Star } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inbox" },
  { href: "/password", label: "Password Generator" },
  { href: "/settings", label: "Settings" },
];

/** Sticky, glassy top navigation. */
export function Header() {
  const pathname = usePathname();

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

          <nav className="hidden items-center gap-1 text-sm md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 transition-colors",
                    active
                      ? "bg-white/5 text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
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

            {/* Mobile nav shortcuts */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                >
                  <Link href="/password">
                    <KeyRound className="h-4 w-4" />
                    <span className="sr-only">Password generator</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Password generator</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Star</span>
                <Star className="h-3 w-3 fill-current text-secondary" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
