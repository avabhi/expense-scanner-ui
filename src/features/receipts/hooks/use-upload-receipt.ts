import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-client';
import { uploadReceipt } from '../api';

/**
 * React Query mutation hook for uploading receipts.
 *
 * Features:
 * - Handles the complete upload flow (hash, upload, ingest)
 * - Automatically invalidates category cache on success
 * - Provides loading, error, and success states
 * - No automatic retry (mutations shouldn't retry by default)
 *
 * Usage:
 * ```ts
 * const { mutate, isPending, error } = useUploadReceipt();
 * mutate(file, {
 *   onSuccess: (data) => console.log('Uploaded:', data.receiptId),
 *   onError: (error) => console.error('Failed:', error.message)
 * });
 * ```
 *
 * @returns Mutation object with mutate function and status
 */
export function useUploadReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadReceipt,
    onSuccess: () => {
      // Invalidate categories to refresh after new upload
      // This triggers a background refetch for all pages using categories
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}
