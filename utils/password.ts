/**
 * Cryptographically-secure password generation + strength estimation.
 *
 * Generation uses the Web Crypto `getRandomValues` with rejection sampling
 * to eliminate modulo bias. Strength is estimated from Shannon entropy
 * (pool size × length), mapped to weak / medium / strong / very-strong.
 */

import type {
  PasswordOptions,
  PasswordStrength,
  PasswordStrengthResult,
} from "@/types";

const POOLS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
} as const;

/** Characters that are easily confused with one another. */
const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "|"]);

function buildPool(options: PasswordOptions): string {
  let pool = "";
  if (options.lowercase) pool += POOLS.lowercase;
  if (options.uppercase) pool += POOLS.uppercase;
  if (options.numbers) pool += POOLS.numbers;
  if (options.symbols) pool += POOLS.symbols;
  if (options.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  return pool;
}

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const buffer = new Uint32Array(1);
  // Rejection sampling to avoid modulo bias.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    crypto.getRandomValues(buffer);
    if (buffer[0]! <= limit) return buffer[0]! % maxExclusive;
  }
}

/**
 * Generates a secure password from the given options.
 *
 * Guarantees at least one character from each ENABLED class is present, so a
 * password never silently drops a requested character type.
 */
export function generatePassword(options: PasswordOptions): string {
  const length = Math.max(4, Math.min(128, Math.round(options.length)));
  const pool = buildPool(options);
  if (pool.length === 0) return "";

  // Required classes — one representative char from each enabled class.
  const required: string[] = [];
  if (options.lowercase) required.push(pickChar(POOLS.lowercase, options));
  if (options.uppercase) required.push(pickChar(POOLS.uppercase, options));
  if (options.numbers) required.push(pickChar(POOLS.numbers, options));
  if (options.symbols) required.push(pickChar(POOLS.symbols, options));

  const chars: string[] = [];
  // Place required chars first (we'll shuffle afterwards).
  chars.push(...required.slice(0, Math.min(required.length, length)));

  // Fill the rest from the combined pool.
  while (chars.length < length) {
    chars.push(pool[secureRandomInt(pool.length)]!);
  }

  // Trim if requirements overfilled (tiny lengths).
  const trimmed = chars.slice(0, length);
  return shuffle(trimmed).join("");
}

function pickChar(set: string, options: PasswordOptions): string {
  const cleaned = options.excludeAmbiguous
    ? [...set].filter((c) => !AMBIGUOUS.has(c)).join("")
    : set;
  const safe = cleaned || set;
  return safe[secureRandomInt(safe.length)]!;
}

/** Fisher–Yates shuffle using the CSPRNG. */
function shuffle(arr: string[]): string[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Estimates password strength from pool size and length.
 *
 * Entropy ≈ length × log2(poolSize). Mapped to buckets:
 *   < 40 bits  → weak
 *   40–59      → medium
 *   60–79      → strong
 *   >= 80      → very-strong
 */
export function estimateStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { strength: "weak", score: 0, entropy: 0 };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  poolSize = Math.max(poolSize, 1);
  const entropy = password.length * Math.log2(poolSize);

  let strength: PasswordStrength;
  if (entropy < 40) strength = "weak";
  else if (entropy < 60) strength = "medium";
  else if (entropy < 80) strength = "strong";
  else strength = "very-strong";

  // Clamp entropy into a 0–100 score for the meter.
  const score = Math.max(0, Math.min(100, Math.round((entropy / 100) * 100)));

  return { strength, score, entropy: Math.round(entropy) };
}

/** Human-readable label + accent color for a strength bucket. */
export const STRENGTH_META: Record<
  PasswordStrength,
  { label: string; color: string; bar: string }
> = {
  weak: { label: "Weak", color: "text-red-400", bar: "bg-red-500" },
  medium: { label: "Medium", color: "text-amber-400", bar: "bg-amber-500" },
  strong: { label: "Strong", color: "text-primary", bar: "bg-primary" },
  "very-strong": {
    label: "Very Strong",
    color: "text-secondary",
    bar: "bg-secondary",
  },
};
