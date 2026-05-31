import { apiClient } from '@/lib/api/client';
import { Receipt } from '../types';

/**
 * Fetches full receipt details by ID.
 * Includes merchant info, total, date, and all line items.
 *
 * @param receiptId - The unique receipt identifier
 * @returns Promise resolving to full receipt details
 * @throws ApiError if receipt not found or request fails
 */
export async function getReceipt(receiptId: string): Promise<Receipt> {
  return apiClient.get<Receipt>(`/api/v1/receipts/${receiptId}`);
}
