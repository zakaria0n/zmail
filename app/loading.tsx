import { Loader2 } from "lucide-react";

/**
 * Route-level loading state.
 *
 * Shown by Next.js while the page chunk loads, providing a polished first
 * paint instead of a blank screen.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <p className="text-sm text-muted">Loading ZMail…</p>
    </div>
  );
}
