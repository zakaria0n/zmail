/**
 * Global keyboard shortcuts hook.
 *
 * Binds a map of shortcuts to handlers. Shortcuts are ignored when the user
 * is typing into an input/textarea/contentEditable to avoid stealing keystrokes.
 *
 * Supported by default (wired up in the inbox):
 *   R  — refresh inbox
 *   N  — generate new email
 *   J  — focus next message
 *   K  — focus previous message
 *   /  — focus the email address
 */

import { useEffect } from "react";

export type ShortcutHandler = (event: KeyboardEvent) => void;
export type ShortcutMap = Record<string, ShortcutHandler>;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const callback = shortcuts[key];
      if (!callback) return;

      // Allow "/" only when not typing; allow letters always except in inputs.
      if (isEditableTarget(event.target)) {
        // Permit Escape to bubble out of inputs.
        if (key !== "escape") return;
      }

      // Avoid hijacking modified keys (Cmd+R, Ctrl+R, etc.).
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      callback(event);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}
