import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-client';
import { getCategoriesSummary } from '../api';

/**
 * React Query hook for fetching category summaries.
 *
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Background refetching when data becomes stale
 * - Automatic error retry
 * - Shared cache across all components using this hook
 *
 * This hook is used by dashboard, history, categories, and reports pages,
 * ensuring they all share the same cached data for optimal performance.
 *
 * @returns Query result with data, loading, and error states
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.summary(),
    queryFn: getCategoriesSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh
  });
}
