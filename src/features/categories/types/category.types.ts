import { ReceiptRef } from '../../receipts/types/receipt.types';

/**
 * Category summary with aggregated spending information.
 * Includes total spent, item count, and list of receipts in this category.
 */
export interface CategorySummary {
  category: string;
  total_spent: number;
  item_count: number;
  receipts: ReceiptRef[];
}
