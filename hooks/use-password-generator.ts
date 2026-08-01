"use client";

/**
 * Password generator hook.
 *
 * Holds the options + current password in local state and exposes
 * generate() + setOptions(). Strength is derived reactively from the
 * current password.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { estimateStrength, generatePassword } from "@/utils/password";
import {
  DEFAULT_PASSWORD_OPTIONS,
  type PasswordOptions,
} from "@/types";

export function usePasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(
    DEFAULT_PASSWORD_OPTIONS,
  );
  const [password, setPassword] = useState("");

  const generate = useCallback((opts?: Partial<PasswordOptions>) => {
    const next = { ...options, ...opts };
    setPassword(generatePassword(next));
  }, [options]);

  // Generate one immediately on first mount so the field is never empty.
  useEffect(() => {
    setPassword(generatePassword(options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOption = useCallback(
    <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
      setOptions((prev) => {
        const next = { ...prev, [key]: value };
        // Ensure at least one class remains enabled.
        const anyEnabled =
          next.uppercase ||
          next.lowercase ||
          next.numbers ||
          next.symbols;
        if (!anyEnabled) return prev;
        setPassword(generatePassword(next));
        return next;
      });
    },
    [],
  );

  const strength = useMemo(
    () => estimateStrength(password),
    [password],
  );

  return { options, password, strength, generate, updateOption };
}
