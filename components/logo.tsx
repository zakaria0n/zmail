import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * ZMail wordmark + logo glyph.
 *
 * The glyph is a rounded square with a stylized envelope notch rendered
 * purely in CSS/SVG so it scales crisply and inherits the brand color.
 */
export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string | null;
  showText?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M4 7.5C4 6.67157 4.67157 6 5.5 6H18.5C19.3284 6 20 6.67157 20 7.5V16.5C20 17.3284 19.3284 18 18.5 18H5.5C4.67157 18 4 17.3284 4 16.5V7.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeDasharray="2.4 2.4"
          />
          <path
            d="M5 7.5L12 12.5L19 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText ? (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Z<span className="text-primary">Mail</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center" aria-label="ZMail home">
      {content}
    </Link>
  );
}
