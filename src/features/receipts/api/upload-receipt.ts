import { apiClient } from '@/lib/api/client';
import { computeFileHash } from '@/lib/utils';
import {
  UploadUrlResponse,
  IngestReceiptRequest,
  IngestReceiptResponse,
} from '../types';

/**
 * Gets a presigned upload URL from the backend.
 *
 * @param filename - The name of the file to upload
 * @returns Promise resolving to upload URL details
 */
export async function getUploadUrl(filename: string): Promise<UploadUrlResponse> {
  return apiClient.get<UploadUrlResponse>('/api/v1/receipts/upload-url', {
    params: { filename },
  });
}

/**
 * Uploads a file directly to cloud storage (S3/MinIO/R2).
 * Handles both PUT (production R2) and POST (dev MinIO) methods.
 *
 * @param uploadUrl - Presigned URL from getUploadUrl
 * @param file - File to upload
 * @param method - HTTP method (PUT or POST)
 * @param fields - Optional form fields for POST uploads
 * @throws Error if upload fails
 */
export async function uploadToStorage(
  uploadUrl: string,
  file: File,
  method: 'POST' | 'PUT',
  fields?: Record<string, string>
): Promise<void> {
  let response: Response;

  if (method === 'PUT') {
    // Production Cloudflare R2 raw binary PUT upload
    response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });
  } else {
    // Local Dev MinIO multipart form-data upload
    const formData = new FormData();
    if (fields) {
      Object.entries(fields).forEach(([key, val]) => {
        formData.append(key, val);
      });
    }
    formData.append('file', file);

    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
  }

  if (!response.ok) {
    throw new Error('Failed to upload receipt to storage');
  }
}

/**
 * Notifies backend that a receipt has been uploaded and should be processed.
 *
 * @param data - Object key and file hash
 * @returns Promise resolving to job ID and receipt ID
 */
export async function ingestReceipt(
  data: IngestReceiptRequest
): Promise<IngestReceiptResponse> {
  return apiClient.post<IngestReceiptResponse>('/api/v1/receipts', data);
}

/**
 * Orchestrates the complete receipt upload flow:
 * 1. Validates file type
 * 2. Computes SHA-256 hash
 * 3. Gets presigned upload URL
 * 4. Uploads to cloud storage
 * 5. Notifies backend to process
 *
 * @param file - The receipt file to upload
 * @returns Promise resolving to job details and preview URL
 * @throws Error if any step fails
 */
export async function uploadReceipt(file: File): Promise<{
  jobId: string;
  receiptId: string;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WEBP image or PDF.');
  }

  // Step 1: Compute file hash
  const fileHash = await computeFileHash(file);

  // Step 2: Get presigned URL
  const uploadDetails = await getUploadUrl(file.name);

  // Step 3: Upload to storage
  await uploadToStorage(
    uploadDetails.url,
    file,
    uploadDetails.method || 'POST',
    uploadDetails.fields
  );

  // Step 4: Ingest receipt
  const result = await ingestReceipt({
    object_key: uploadDetails.object_key,
    file_hash: fileHash,
  });

  // Step 5: Create preview URL
  const previewUrl = URL.createObjectURL(file);

  return {
    jobId: result.job_id,
    receiptId: result.receipt_id,
    previewUrl,
    status: result.status,
  };
}
