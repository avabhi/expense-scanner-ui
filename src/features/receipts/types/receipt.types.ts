/**
 * Receipt line item with extracted details.
 */
export interface LineItem {
  id: string;
  description: string;
  price: number;
  category: string | null;
}

/**
 * Receipt reference with basic summary information.
 * Used in lists and summaries across the application.
 */
export interface ReceiptRef {
  receipt_id: string;
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
  category?: string;
  status?: string;
}

/**
 * Full receipt details with all extracted information.
 * Returned when fetching a specific receipt by ID.
 */
export interface Receipt {
  id: string;
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
  status: string;
  line_items: LineItem[];
}

/**
 * Response from getting a presigned upload URL.
 */
export interface UploadUrlResponse {
  url: string;
  method?: 'POST' | 'PUT';
  fields?: Record<string, string>;
  object_key: string;
}

/**
 * Request payload for ingesting a receipt after upload.
 */
export interface IngestReceiptRequest {
  object_key: string;
  file_hash: string;
}

/**
 * Response from receipt ingestion endpoint.
 */
export interface IngestReceiptResponse {
  job_id: string;
  receipt_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Server-Sent Event structure for receipt processing status.
 */
export interface ReceiptStatusEvent {
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  step: string;
  message: string;
}
