/**
 * Centralized React Query key factory.
 *
 * Co-locating all query keys prevents cache collisions and makes cache
 * invalidation predictable across hooks.
 */

export const queryKeys = {
  messages: ["messages"] as const,
  message: (id: string) => ["message", id] as const,
} as const;
