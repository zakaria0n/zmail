/**
 * Tiny typed wrapper around `localStorage`.
 *
 * All persistence in ZMail goes through here so the storage key namespace
 * stays centralized and values are always JSON-validated.
 */

import type { StoredAccount } from "@/types";

export const STORAGE_KEYS = {
  account: "zmail:account:v1",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAccount(): StoredAccount | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.account);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAccount;
    if (
      typeof parsed?.address === "string" &&
      typeof parsed?.password === "string" &&
      typeof parsed?.token === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAccount(account: StoredAccount): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.account, JSON.stringify(account));
  } catch {
    /* storage may be unavailable (private mode) — fail silently */
  }
}

export function clearAccount(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.account);
  } catch {
    /* no-op */
  }
}
