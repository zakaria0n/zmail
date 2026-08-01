/**
 * Small, dependency-light class name combiner.
 *
 * Uses `clsx` for conditional values and `tailwind-merge` to de-duplicate
 * conflicting Tailwind utilities (e.g. `px-2 px-4` → `px-4`).
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
