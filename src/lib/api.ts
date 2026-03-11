/**
 * API Client
 *
 * Centralized HTTP client for the CodeLeap careers API.
 * Provides typed methods for CRUD operations on posts.
 * Base URL is configurable via NEXT_PUBLIC_API_URL environment variable.
 */
import type { Post, PaginatedResponse, CreatePostPayload, UpdatePostPayload } from '@/types/api';

// API base URL — defaults to CodeLeap dev server if not overridden
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://dev.codeleap.co.uk/careers/';

/**
 * Generic fetch wrapper with JSON content-type and error handling.
 * Returns parsed JSON response or undefined for 204 No Content.
 */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** API methods for post CRUD operations */
export const api = {
  /** Fetch a paginated list of posts (for infinite scroll) */
  getPosts: (limit = 10, offset = 0): Promise<PaginatedResponse> =>
    request<PaginatedResponse>(`${BASE_URL}?limit=${limit}&offset=${offset}`),

  /** Create a new post */
  createPost: (payload: CreatePostPayload): Promise<Post> =>
    request<Post>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Update an existing post's title and/or content */
  updatePost: (id: number, payload: UpdatePostPayload): Promise<Post> =>
    request<Post>(`${BASE_URL}${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  /** Delete a post by ID */
  deletePost: (id: number): Promise<void> =>
    request<void>(`${BASE_URL}${id}/`, { method: 'DELETE' }),
};
