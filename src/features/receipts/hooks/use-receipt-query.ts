import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-client';
import { getReceipt } from '../api';

/**
 * React Query hook for fetching a specific receipt's details.
 *
 * Features:
 * - Only fetches when receiptId is provided (enabled: !!receiptId)
 * - 10-minute stale time (receipt data rarely changes once processed)
 * - Automatic caching and background refetching
 * - Error retry with exponential backoff
 *
 * @param receiptId - The receipt ID to fetch (null to disable query)
 * @returns Query result with receipt data, loading, and error states
 */
export function useReceiptQuery(receiptId: string | null) {
  return useQuery({
    queryKey: queryKeys.receipts.detail(receiptId || ''),
    queryFn: () => getReceipt(receiptId!),
    enabled: !!receiptId, // Only fetch when receiptId is available
    staleTime: 1000 * 60 * 10, // 10 minutes - receipt data doesn't change once processed
  });
}
