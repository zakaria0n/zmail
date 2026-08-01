/**
 * mail.tm API client.
 *
 * A thin, fully-typed wrapper around the public mail.tm REST API
 * (https://api.mail.tm). Handles base URL, JSON headers, Bearer token
 * injection, error normalization and response typing.
 *
 * This is the ONLY data source used by ZMail and lives behind the
 * `mailtm` namespace so the rest of the app never touches `fetch` directly.
 */

import type {
  Account,
  Domain,
  HydraCollection,
  MailTmError,
  Message,
  MessageDetail,
  TokenResponse,
} from "@/types";

export const MAILTM_BASE_URL = "https://api.mail.tm";

const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

type FetchOptions = {
  token?: string;
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

class MailTmApiError extends Error implements MailTmError {
  status: number;
  detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "MailTmApiError";
    this.status = status;
    this.detail = detail;
  }
}

function buildUrl(path: string, query?: FetchOptions["query"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${MAILTM_BASE_URL}${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, method = "GET", body, query, signal } = options;

  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      cache: "no-store",
    });
  } catch (cause) {
    if (cause instanceof Error && cause.name === "AbortError") {
      throw cause;
    }
    throw new MailTmApiError(
      0,
      "Network error — could not reach mail.tm. Check your connection and try again.",
      { cause },
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const apiMessage =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof (payload as { detail: unknown }).detail === "string"
        ? ((payload as { detail: string }).detail)
        : undefined;
    const message =
      apiMessage ??
      (response.status === 401
        ? "Your session has expired. Generating a new inbox."
        : response.status === 429
          ? "Too many requests. Please wait a moment and try again."
          : `Request failed with status ${response.status}.`);
    throw new MailTmApiError(response.status, message, payload);
  }

  return payload as T;
}

/** Public namespace consumed by the rest of the application. */
export const mailtm = {
  /** GET /domains — list of usable inbox domains. */
  async getDomains(signal?: AbortSignal): Promise<Domain[]> {
    const data = await request<HydraCollection<Domain>>("/domains", {
      signal,
      query: { page: 1 },
    });
    const active = (data["hydra:member"] ?? []).filter((d) => d.isActive);
    return active.length > 0 ? active : (data["hydra:member"] ?? []);
  },

  /** POST /accounts — create a new temporary mailbox. */
  async createAccount(
    params: { address: string; password: string },
    signal?: AbortSignal,
  ): Promise<Account> {
    return request<Account>("/accounts", {
      method: "POST",
      body: params,
      signal,
    });
  },

  /** POST /token — exchange credentials for a JWT. */
  async getToken(
    params: { address: string; password: string },
    signal?: AbortSignal,
  ): Promise<TokenResponse> {
    return request<TokenResponse>("/token", {
      method: "POST",
      body: params,
      signal,
    });
  },

  /** GET /me — fetch the currently authenticated account. */
  async getMe(token: string, signal?: AbortSignal): Promise<Account> {
    return request<Account>("/me", { token, signal });
  },

  /** DELETE /accounts/{id} — permanently delete a mailbox. */
  async deleteAccount(
    params: { id: string; token: string },
    signal?: AbortSignal,
  ): Promise<void> {
    await request<void>(`/accounts/${params.id}`, {
      method: "DELETE",
      token: params.token,
      signal,
    });
  },

  /** GET /messages — list messages for the authenticated account. */
  async getMessages(
    params: { token: string; page?: number },
    signal?: AbortSignal,
  ): Promise<HydraCollection<Message>> {
    return request<HydraCollection<Message>>("/messages", {
      token: params.token,
      query: { page: params.page ?? 1 },
      signal,
    });
  },

  /** GET /messages/{id} — fetch a single message with full body. */
  async getMessage(
    params: { id: string; token: string },
    signal?: AbortSignal,
  ): Promise<MessageDetail> {
    return request<MessageDetail>(`/messages/${params.id}`, {
      token: params.token,
      signal,
    });
  },

  /** PATCH /messages/{id} — mark a message as seen/unseen. */
  async markMessage(
    params: { id: string; token: string; seen: boolean },
    signal?: AbortSignal,
  ): Promise<Message> {
    return request<Message>(`/messages/${params.id}`, {
      method: "PATCH",
      token: params.token,
      body: { seen: params.seen },
      signal,
    });
  },

  /** DELETE /messages/{id} — delete a single message. */
  async deleteMessage(
    params: { id: string; token: string },
    signal?: AbortSignal,
  ): Promise<void> {
    await request<void>(`/messages/${params.id}`, {
      method: "DELETE",
      token: params.token,
      signal,
    });
  },

  /** Mark all unread messages as seen (best-effort). */
  async markAllSeen(
    params: { messages: Message[]; token: string },
    signal?: AbortSignal,
  ): Promise<void> {
    const unread = params.messages.filter((m) => !m.seen);
    await Promise.all(
      unread.map((m) =>
        mailtm.markMessage({ id: m.id, token: params.token, seen: true }, signal),
      ),
    );
  },
};

export { MailTmApiError };
