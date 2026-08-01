/**
 * Centralized site configuration for ZMail.
 *
 * Keeping all metadata, links, and feature flags in one place avoids
 * duplication and makes it trivial to rebrand the product.
 */

export const siteConfig = {
  name: "ZMail",
  shortName: "ZMail",
  title: "ZMail — Premium Disposable Email, Instantly",
  description:
    "ZMail is a premium temporary email service. Generate a disposable inbox in one click, receive emails instantly, and protect your real address from spam. No signup required.",
  url: "https://zmail.vercel.app",
  locale: "en_US",
  themeColor: "#0F1115",
  author: "ZMail",
  keywords: [
    "temporary email",
    "disposable email",
    "temp mail",
    "anonymous email",
    "burner email",
    "spam protection",
    "instant inbox",
    "zmail",
  ],
  links: {
    github: "https://github.com/zakaria0n/zmail",
    twitter: "https://twitter.com",
  },
  /** Polling interval (ms) used to auto-refresh the inbox. */
  inboxRefreshIntervalMs: 10_000,
  /** Length of the random username generated for each new account. */
  usernameLength: 12,
} as const;

export type SiteConfig = typeof siteConfig;
