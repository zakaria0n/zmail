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
