/**
 * Shared domain types for ZMail.
 *
 * These mirror the public mail.tm API responses and the internal
 * application state shapes used across the client.
 */

/** A mail.tm domain that can be used to provision a new inbox. */
export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Paginated collection wrapper returned by mail.tm list endpoints. */
export interface HydraCollection<T> {
  "@context": string;
  "@id": string;
  "@type": string;
  "hydra:totalItems": number;
  "hydra:member": T[];
  "hydra:view"?: {
    "@type": string;
    "@id": string;
    "hydra:last"?: string;
    "hydra:next"?: string;
    "hydra:first"?: string;
    "hydra:previous"?: string;
  };
}

/** Locally persisted account credentials for a temporary inbox. */
export interface Account {
  id: string;
  address: string;
  password: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** JWT token response returned after authenticating. */
export interface TokenResponse {
  token: string;
  id: string;
}

/** Sender / recipient reference embedded in a message. */
export interface Contact {
  address: string;
  name: string;
}

/** A received email message. */
export interface Message {
  id: string;
  accountId: string;
  msgid: string;
  from: Contact;
  to: Contact[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

/** Full message payload including rendered HTML + plain text bodies. */
export interface MessageDetail extends Message {
  cc: Contact[];
  bcc: Contact[];
  flagged: boolean;
  verifications: string;
  retention: boolean;
  retentionDate: string;
  text: string;
  html: string[];
  attachments: Attachment[];
}

/** A file attached to a message. */
export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  disposition: string;
  transferEncoding: string;
  related: boolean;
  size: number;
  downloadUrl: string;
}

/** Shape of the credentials persisted in localStorage. */
export interface StoredAccount {
  id: string;
  address: string;
  password: string;
  token: string;
  createdAt: string;
}

/**
 * A persisted temporary mailbox.
 *
 * Multiple mailboxes can exist at once; the active one is tracked by id.
 * Credentials (password + JWT) are stored locally so switching is instant.
 */
export interface Mailbox {
  /** mail.tm account id. */
  id: string;
  /** Full email address (e.g. `john123@web-library.net`). */
  address: string;
  /** Plaintext password used to re-authenticate if the JWT expires. */
  password: string;
  /** JWT bearer token for mail.tm API calls. */
  token: string;
  /** The domain this mailbox was provisioned against. */
  domain: string;
  /** ISO timestamp of creation. Used for the 7-day lifetime. */
  createdAt: string;
  /** Optional user-facing label / alias (e.g. "Work"). */
  label?: string;
  /** Whether the user starred/favorited this mailbox. */
  favorite?: boolean;
}

/** The whole persisted application state (mailboxes + active selection). */
export interface MailboxStoreData {
  /** v1 keys for forward compatibility. */
  version: 1;
  mailboxes: Mailbox[];
  /** id of the currently active mailbox, or null. */
  activeId: string | null;
}

/**
 * User-configurable application settings, persisted to localStorage.
 */
export interface Settings {
  /** Inbox auto-refresh interval, in milliseconds. */
  refreshIntervalMs: number;
  /** Whether the inbox auto-refreshes at all. */
  autoRefreshEnabled: boolean;
  /** Whether to prune mailboxes older than 7 days on startup. */
  pruneExpiredEnabled: boolean;
}

/** Default settings used on first run and as import-merge fallbacks. */
export const DEFAULT_SETTINGS: Settings = {
  refreshIntervalMs: 10_000,
  autoRefreshEnabled: true,
  pruneExpiredEnabled: true,
};

/** Maximum mailbox lifetime before local pruning (7 days, in ms). */
export const MAILBOX_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Character-class options for the password generator. */
export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  /** Avoid ambiguous characters (0/O, 1/l/I). */
  excludeAmbiguous: boolean;
}

/** Default password generator options. */
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

/** Strength buckets returned by the password strength estimator. */
export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

/** Result of estimating password strength. */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  /** 0–100 score used to drive the meter width. */
  score: number;
  /** Estimated entropy in bits. */
  entropy: number;
}

/** Options accepted by the mail.tm message listing helper. */
export interface ListMessagesOptions {
  page?: number;
  seen?: boolean;
}

/** Generic error thrown by the mail.tm service layer. */
export interface MailTmError {
  status: number;
  message: string;
  detail?: unknown;
}
