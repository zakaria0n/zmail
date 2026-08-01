"use client";

import * as React from "react";

import { wrapHtmlForFrame } from "@/utils/html";

interface MessageHtmlFrameProps {
  html: string;
  className?: string;
}

/**
 * Renders untrusted email HTML inside a fully sandboxed iframe.
 *
 * This is the primary XSS defence: the iframe has no `allow-same-origin`,
 * so its content cannot touch the parent document, cookies or localStorage.
 * The HTML is additionally sanitized by `wrapHtmlForFrame` as a second line.
 */
export function MessageHtmlFrame({ html, className }: MessageHtmlFrameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(320);

  // Build the sandboxed document via srcdoc (no network, no same-origin).
  const srcDoc = React.useMemo(() => wrapHtmlForFrame(html), [html]);

  // Auto-resize the frame to fit its content.
  const syncHeight = React.useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      const next = Math.max(
        280,
        Math.min(doc.body.scrollHeight, doc.documentElement.scrollHeight) + 24,
      );
      setHeight(next);
    } catch {
      /* cross-origin sandbox → can't measure; keep default */
    }
  }, []);

  React.useEffect(() => {
    syncHeight();
  }, [srcDoc, syncHeight]);

  return (
    <iframe
      ref={iframeRef}
      title="Email content"
      srcDoc={srcDoc}
      onLoad={syncHeight}
      sandbox=""
      className={`w-full rounded-xl border border-border bg-white ${className ?? ""}`}
      style={{ height }}
    />
  );
}
