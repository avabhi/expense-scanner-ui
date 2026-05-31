import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Default configuration for all React Query queries and mutations.
 * These settings optimize for a balance between fresh data and performance.
 */
const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh for this duration
    gcTime: 1000 * 60 * 30, // 30 minutes - cache persists this long after last usage (formerly cacheTime)
    retry: 1, // Retry failed requests once before giving up
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  },
  mutations: {
    retry: false, // Don't retry mutations by default (create/update/delete operations)
  },
};

/**
 * Global QueryClient instance used throughout the application.
 * Provides caching, background refetching, and request deduplication.
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query Keys Factory Pattern
 * Provides consistent, type-safe cache keys for all queries.
 * Following the pattern: [feature, operation, ...params]
 */
export const queryKeys = {
  receipts: {
    all: ['receipts'] as const,
    detail: (id: string) => [...queryKeys.receipts.all, 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    summary: () => [...queryKeys.categories.all, 'summary'] as const,
  },
} as const;
