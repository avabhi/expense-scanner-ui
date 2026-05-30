import { getSession, signOut } from "next-auth/react";
import { BACKEND_URL } from "./config";

/**
 * A wrapper around the native fetch API that automatically appends the
 * backend JWT from the active NextAuth session to the Authorization header.
 * If the API returns a 401 Unauthorized, it signs the user out.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  const token = (session as { backendAccessToken?: string } | null)?.backendAccessToken;

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  const targetUrl = url.startsWith("http") ? url : `${BACKEND_URL}${cleanUrl}`;

  const response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn("Backend returned 401. Session may have expired. Signing out...");
    // Redirect to home page on signout
    await signOut({ callbackUrl: "/" });
  }

  return response;
}
