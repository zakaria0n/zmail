/**
 * Account orchestration service.
 *
 * Encapsulates the multi-step mail.tm provisioning flow and transparent token
 * re-authentication so the UI only deals with `Mailbox` objects.
 */

import { buildEmail, randomString, randomUsername } from "@/utils/email";
import { mailtm } from "@/services/mailtm";
import type { Domain, Mailbox } from "@/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches a JWT, retrying briefly to absorb the mail.tm propagation delay —
 * right after `POST /accounts`, credentials can be rejected with 401 for a
 * moment until the account is fully indexed.
 */
async function getTokenWithBackoff(
  params: { address: string; password: string },
  signal?: AbortSignal,
) {
  const waits = [400, 900, 1600, 2500];
  let lastError: unknown;
  for (let i = 0; i < waits.length; i++) {
    try {
      return await mailtm.getToken(params, signal);
    } catch (error) {
      lastError = error;
      const status =
        error instanceof Error && "status" in error
          ? (error as { status: number }).status
          : 0;
      if (status !== 401) throw error;
      await sleep(waits[i]!);
    }
  }
  throw (
    lastError ??
    new Error("Could not authenticate the new inbox. Please try again.")
  );
}

/** Fetches the list of usable (active) domains. */
export async function fetchDomains(signal?: AbortSignal): Promise<Domain[]> {
  return mailtm.getDomains(signal);
}

/**
 * Provisions a brand-new mailbox against a chosen domain.
 *
 * Retries username generation if the chosen address is already taken
 * (HTTP 422/409), the most common transient failure.
 */
export async function provisionMailbox(
  domain: Domain,
  signal?: AbortSignal,
): Promise<Mailbox> {
  const password = randomString(20);

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const address = buildEmail(randomUsername(), domain.domain);
    try {
      const account = await mailtm.createAccount({ address, password }, signal);
      const token = await getTokenWithBackoff({ address, password }, signal);

      const mailbox: Mailbox = {
        id: account.id,
        address: account.address,
        password,
        token: token.token,
        domain: domain.domain,
        createdAt: account.createdAt,
        favorite: false,
      };
      return mailbox;
    } catch (error) {
      lastError = error;
      if (error instanceof Error && "status" in error) {
        const status = (error as { status: number }).status;
        if (status !== 422 && status !== 409) break;
      } else {
        break;
      }
    }
  }

  throw (
    lastError ??
    new Error("Failed to create a temporary inbox. Please try again.")
  );
}

/**
 * Provisions a mailbox against any active domain (auto-picks the first).
 */
export async function provisionMailboxAuto(signal?: AbortSignal): Promise<Mailbox> {
  const domains = await fetchDomains(signal);
  if (domains.length === 0) {
    throw new Error(
      "No active mail.tm domains are available right now. Try again in a moment.",
    );
  }
  return provisionMailbox(domains[0]!, signal);
}

/**
 * Transparently refreshes a mailbox's JWT if the stored token is rejected.
 *
 * Returns the mailbox with a valid token (re-authenticating with the saved
 * password if needed). The caller should persist the refreshed token.
 */
export async function ensureValidToken(
  mailbox: Mailbox,
  signal?: AbortSignal,
): Promise<Mailbox> {
  // Fast path: probe the current token with a cheap /me call.
  try {
    await mailtm.getMe(mailbox.token, signal);
    return mailbox;
  } catch (error) {
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 0;
    if (status !== 401) {
      // Network error or server fault — keep the existing token; let the
      // caller surface its own error handling.
      return mailbox;
    }
  }

  // Token expired → request a fresh one with saved credentials.
  const token = await getTokenWithBackoff(
    { address: mailbox.address, password: mailbox.password },
    signal,
  );
  return { ...mailbox, token: token.token };
}
