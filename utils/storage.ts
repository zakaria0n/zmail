/**
 * Typed localStorage persistence for ZMail.
 *
 * Owns THREE namespaces:
 *  - mailboxes: the multi-mailbox store (array + active id) + 7-day pruning
 *  - settings: user-configurable app settings
 *  - legacy single-account key (migrated transparently on first load)
 *
 * All read/write is guarded with try/catch so a corrupted or unavailable
 * storage (private mode) never crashes the app.
 */

import {
  DEFAULT_SETTINGS,
  MAILBOX_MAX_AGE_MS,
  type Mailbox,
  type MailboxStoreData,
  type Settings,
  type StoredAccount,
} from "@/types";

export const STORAGE_KEYS = {
  /** Legacy single-account key (v1 of the app). Kept for one-shot migration. */
  account: "zmail:account:v1",
  /** Multi-mailbox store. */
  mailboxes: "zmail:mailboxes:v1",
  /** User settings. */
  settings: "zmail:settings:v1",
} as const;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function readJSON<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/* ------------------------------------------------------------------ */
/* Mailboxes                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_STORE: MailboxStoreData = { version: 1, mailboxes: [], activeId: null };

/** Returns true if a mailbox is older than the 7-day lifetime. */
export function isMailboxExpired(mailbox: Mailbox, now = Date.now()): boolean {
  const created = new Date(mailbox.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return now - created > MAILBOX_MAX_AGE_MS;
}

/**
 * Loads the mailbox store, pruning expired entries when requested.
 *
 * Also performs a one-shot migration of the legacy single-account key so
 * existing users don't lose their inbox on upgrade.
 */
export function loadMailboxStore(prune = true): MailboxStoreData {
  let data = readJSON<MailboxStoreData>(STORAGE_KEYS.mailboxes);

  // One-shot migration from the legacy single-account format.
  if (!data) {
    const legacy = readJSON<StoredAccount>(STORAGE_KEYS.account);
    if (legacy && legacy.address && legacy.token) {
      data = {
        version: 1,
        mailboxes: [
          {
            id: legacy.id,
            address: legacy.address,
            password: legacy.password,
            token: legacy.token,
            domain: legacy.address.split("@")[1] ?? "",
            createdAt: legacy.createdAt,
            favorite: false,
          },
        ],
        activeId: legacy.id,
      };
      writeJSON(STORAGE_KEYS.mailboxes, data);
      removeKey(STORAGE_KEYS.account);
    }
  }

  if (!data || !Array.isArray(data.mailboxes)) {
    return { ...EMPTY_STORE };
  }

  let mailboxes = data.mailboxes.filter(
    (m): m is Mailbox =>
      Boolean(m && m.id && m.address && m.token && m.createdAt),
  );

  if (prune) {
    mailboxes = mailboxes.filter((m) => !isMailboxExpired(m));
  }

  // Ensure activeId points at a mailbox that still exists.
  const activeId =
    mailboxes.some((m) => m.id === data!.activeId) && data.activeId
      ? data.activeId
      : (mailboxes[0]?.id ?? null);

  const result: MailboxStoreData = {
    version: 1,
    mailboxes,
    activeId,
  };

  // Persist if pruning changed anything.
  if (
    prune &&
    (mailboxes.length !== data.mailboxes.length || activeId !== data.activeId)
  ) {
    writeJSON(STORAGE_KEYS.mailboxes, result);
  }

  return result;
}

/** Persists the full mailbox store. */
export function saveMailboxStore(data: MailboxStoreData): void {
  writeJSON(STORAGE_KEYS.mailboxes, data);
}

/** Updates a single mailbox's record in storage (merges by id). */
export function updateMailboxInStorage(
  id: string,
  patch: Partial<Mailbox>,
): MailboxStoreData {
  const data = loadMailboxStore(false);
  const mailboxes = data.mailboxes.map((m) =>
    m.id === id ? { ...m, ...patch } : m,
  );
  const next = { ...data, mailboxes };
  saveMailboxStore(next);
  return next;
}

/** Removes all mailboxes + settings from storage (full local wipe). */
export function clearAllData(): void {
  removeKey(STORAGE_KEYS.mailboxes);
  removeKey(STORAGE_KEYS.settings);
  removeKey(STORAGE_KEYS.account);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function loadSettings(): Settings {
  const stored = readJSON<Partial<Settings>>(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export function saveSettings(settings: Settings): void {
  writeJSON(STORAGE_KEYS.settings, settings);
}
