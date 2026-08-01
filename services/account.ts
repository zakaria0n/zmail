/**
 * Account orchestration service.
 *
 * Encapsulates the multi-step mail.tm provisioning flow so UI code only ever
 * calls `provisionAccount()` / `createNewAccount()`. Keeps the happy-path and
 * error handling logic in a single, well-tested location.
 */

import { buildEmail, randomString, randomUsername } from "@/utils/email";
import { mailtm } from "@/services/mailtm";
import { clearAccount, saveAccount } from "@/utils/storage";
import type { StoredAccount } from "@/types";

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

/**
 * Provisions a brand new temporary inbox.
 *
 * Steps:
 *  1. Fetch the list of active domains.
 *  2. Generate a random username + strong password.
 *  3. Create the account on mail.tm.
 *  4. Exchange credentials for a JWT (with propagation backoff).
 *  5. Persist everything to localStorage and return it.
 */
export async function provisionAccount(signal?: AbortSignal): Promise<StoredAccount> {
  const domains = await mailtm.getDomains(signal);
  if (domains.length === 0) {
    throw new Error("No active mail.tm domains are available right now. Try again in a moment.");
  }
  const domain = domains[0]!.domain;

  return createNewAccount(domain, signal);
}

/**
 * Creates a new account against a specific domain.
 *
 * Retries username generation if the chosen address is already taken
 * (HTTP 422/409), which is the most common transient failure when provisioning.
 */
export async function createNewAccount(
  domain: string,
  signal?: AbortSignal,
): Promise<StoredAccount> {
  const password = randomString(20);

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const address = buildEmail(randomUsername(), domain);
    try {
      const account = await mailtm.createAccount({ address, password }, signal);
      const token = await getTokenWithBackoff({ address, password }, signal);

      const stored: StoredAccount = {
        id: account.id,
        address: account.address,
        password,
        token: token.token,
        createdAt: account.createdAt,
      };
      saveAccount(stored);
      return stored;
    } catch (error) {
      lastError = error;
      // Only retry on address-in-use / validation conflicts.
      if (error instanceof Error && "status" in error) {
        const status = (error as { status: number }).status;
        if (status !== 422 && status !== 409) break;
      } else {
        break;
      }
    }
  }

  clearAccount();
  throw (
    lastError ??
    new Error("Failed to create a temporary inbox. Please try again.")
  );
}

/** Removes all locally stored credentials. */
export function signOut(): void {
  clearAccount();
}
