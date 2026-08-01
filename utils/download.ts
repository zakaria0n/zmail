/**
 * Browser download helpers.
 *
 * Triggers a client-side file download via a transient blob URL so we don't
 * need any server-side streaming for "download email".
 */

/** Triggers a download of arbitrary text content. */
export function downloadText(
  filename: string,
  content: string,
  mime = "text/plain",
): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  triggerBlobDownload(filename, blob);
}

/** Triggers a download of a full HTML document. */
export function downloadHtml(filename: string, html: string): void {
  downloadText(filename, html, "text/html");
}

function triggerBlobDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on the next tick so the click has time to register.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** Builds a safe filename from a message subject. */
export function slugifySubject(subject: string, fallback = "email"): string {
  const slug = subject
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || fallback;
}
