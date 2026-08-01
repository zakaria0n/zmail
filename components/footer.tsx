"use client";

import { Heart } from "lucide-react";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Logo href="/" />
        <p className="order-3 flex items-center gap-1.5 text-xs text-muted sm:order-2">
          Built with <Heart className="h-3 w-3 fill-primary text-primary" /> using
          Next.js &amp; mail.tm
        </p>
        <div className="order-2 flex items-center gap-4 text-xs text-muted sm:order-3">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
