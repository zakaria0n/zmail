/**
 * Formatting helpers for dates, sizes and contacts used across the UI.
 */

/** Relative time formatter ("3m ago", "in 2h", "just now"). */
export function timeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSec < 45) return rtf.format(Math.round(diffSec), "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day");

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/** Absolute, human-readable timestamp (e.g. "Aug 1, 2026 · 7:30 PM"). */
export function formatDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Pretty file-size formatter ("1.4 KB", "3.2 MB"). */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i] ?? "B"}`;
}

/** Best-effort display name for a contact ("Jane Doe" or fallback to address). */
export function contactLabel(name?: string, address?: string): string {
  const cleanName = (name ?? "").trim();
  if (cleanName) return cleanName;
  if (address) return address;
  return "Unknown sender";
}

/** Extracts the initials from a name or address for avatars. */
export function initials(name?: string, address?: string): string {
  const base = (name ?? address ?? "?").trim();
  const match = base.match(/^[^@\s]+/);
  const handle = match ? match[0] : base;
  const parts = handle.split(/[.\-_ ]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return handle.slice(0, 2).toUpperCase();
}

/** Truncates a string to a max length, adding an ellipsis when cut. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
