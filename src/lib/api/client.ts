import { getSession, signOut } from 'next-auth/react';
import { BACKEND_URL } from '../config';

/**
 * Custom error class for API errors with status codes and response data.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extended RequestInit with optional query parameters.
 */
export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Type-safe API client with automatic authentication token injection.
 * Handles common concerns: auth headers, error handling, 401 redirects, URL building.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves auth headers with JWT token from NextAuth session.
   */
  private async getAuthHeaders(): Promise<Headers> {
    const session = await getSession();
    const token = (session as { backendAccessToken?: string } | null)?.backendAccessToken;

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Builds full URL with base URL and optional query parameters.
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Handles response parsing and error cases.
   * Automatically signs out user on 401 Unauthorized.
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 401 Unauthorized - sign out user
    if (response.status === 401) {
      console.warn('Backend returned 401. Session expired. Signing out...');
      await signOut({ callbackUrl: '/' });
      throw new ApiError('Session expired', 401, response.statusText);
    }

    // Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      throw new ApiError(
        errorData?.message || `Request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Performs a GET request.
   * @param endpoint - API endpoint (e.g., '/api/v1/categories/summary')
   * @param config - Optional request configuration with query params
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Performs a POST request.
   * @param endpoint - API endpoint
   * @param data - Request body (will be JSON stringified)
   * @param config - Optional request configuration
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Performs a PUT request.
   * @param endpoint - API endpoint
   * @param data - Request body (will be JSON stringified)
   * @param config - Optional request configuration
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Performs a DELETE request.
   * @param endpoint - API endpoint
   * @param config - Optional request configuration
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      ...config,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Direct fetch with auth headers for non-JSON requests (e.g., file uploads).
   * Returns the raw Response object for custom handling.
   */
  async fetchWithAuth(url: string, config?: RequestInit): Promise<Response> {
    const headers = await this.getAuthHeaders();
    const targetUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    const response = await fetch(targetUrl, {
      ...config,
      headers: {
        ...Object.fromEntries(headers),
        ...Object.fromEntries(new Headers(config?.headers || {})),
      },
    });

    if (response.status === 401) {
      console.warn('Backend returned 401. Session expired. Signing out...');
      await signOut({ callbackUrl: '/' });
    }

    return response;
  }
}

/**
 * Singleton API client instance.
 * Use this throughout the application for all backend API calls.
 */
export const apiClient = new ApiClient(BACKEND_URL);
