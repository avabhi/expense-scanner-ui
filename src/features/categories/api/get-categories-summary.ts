import { apiClient } from '@/lib/api/client';
import { CategorySummary } from '../types';

/**
 * Fetches category summary data from the backend.
 * Data includes total spent, item count, and receipt references per category.
 *
 * @returns Promise resolving to array of category summaries
 * @throws ApiError if request fails or user is unauthorized
 */
export async function getCategoriesSummary(): Promise<CategorySummary[]> {
  return apiClient.get<CategorySummary[]>('/api/v1/categories/summary');
}
