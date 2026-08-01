/**
 * Account lifecycle hook.
 *
 * Wraps the provisioning flow in React Query + the Zustand store so the UI can
 * call a single `provision()` function to create the very first inbox, and
 * `generateNew()` to roll a fresh one.
 */

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { createNewAccount, provisionAccount, signOut } from "@/services/account";
import { useAccountStore } from "@/store/account-store";
import { clearAccount } from "@/utils/storage";

export function useProvisionAccount() {
  const setAccount = useAccountStore((s) => s.setAccount);
  const setProvisioning = useAccountStore((s) => s.setProvisioning);
  const setError = useAccountStore((s) => s.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signal: AbortSignal | undefined) =>
      provisionAccount(signal),
    onMutate: () => setProvisioning(),
    onSuccess: (account) => {
      setAccount(account);
      void queryClient.invalidateQueries();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate an inbox. Please try again.";
      setError(message);
    },
  });
}

export function useGenerateNewAccount() {
  const setAccount = useAccountStore((s) => s.setAccount);
  const setProvisioning = useAccountStore((s) => s.setProvisioning);
  const setError = useAccountStore((s) => s.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signal: AbortSignal | undefined) => {
      // Provision a brand-new mailbox (fresh domain pick + username).
      return provisionAccount(signal);
    },
    onMutate: () => {
      setProvisioning();
      // Drop the previous inbox's cached messages immediately.
      queryClient.removeQueries();
    },
    onSuccess: (account) => {
      setAccount(account);
      void queryClient.invalidateQueries();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate a new inbox. Please try again.";
      setError(message);
    },
  });
}

/** Destroys the local session and clears all cached state. */
export function useResetAccount() {
  const reset = useAccountStore((s) => s.reset);
  const queryClient = useQueryClient();

  return () => {
    signOut();
    clearAccount();
    reset();
    queryClient.removeQueries();
  };
}

export { createNewAccount };
