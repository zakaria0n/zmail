/**
 * Username + email generation helpers.
 */

import { siteConfig } from "@/config/site";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Cryptographically-strong random string generator.
 *
 * Uses the Web Crypto API when available (browser + Node 19+) and falls back
 * to Math.random for extremely old environments. The result only contains
 * URL-safe, lowercase alphanumeric characters which mail.tm accepts.
 */
export function randomString(length: number): string {
  const chars =
    typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
      ? secureChars(length)
      : insecureChars(length);
  return chars.slice(0, length);
}

function secureChars(length: number): string {
  const max = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  let out = "";
  for (let i = 0; i < length; i++) {
    let value = buffer[i]!;
    while (value >= max) {
      const refill = new Uint8Array(1);
      crypto.getRandomValues(refill);
      value = refill[0]!;
    }
    out += ALPHABET[value % ALPHABET.length];
  }
  return out;
}

function insecureChars(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Returns a random, mail.tm-safe username.
 *
 * Uses a single alphanumeric token (no dots/separators): mail.tm accepts these
 * for account creation AND reliably authenticates them, whereas dotted local
 * parts can be created but then rejected by `/token`.
 */
export function randomUsername(length = siteConfig.usernameLength): string {
  return randomString(length);
}

/** Combines a username and domain into a full email address. */
export function buildEmail(username: string, domain: string): string {
  return `${username}@${domain}`.toLowerCase();
}
