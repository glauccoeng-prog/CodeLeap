/**
 * API Type Definitions
 *
 * TypeScript interfaces for the CodeLeap careers API.
 * These types are used across hooks and components for type safety.
 */

/** A single post returned by the API */
export interface Post {
  id: number;
  username: string;
  created_datetime: string;
  title: string;
  content: string;
}

/** Paginated API response with cursor-based navigation */
export interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

/** Payload for creating a new post (POST /careers/) */
export interface CreatePostPayload {
  username: string;
  title: string;
  content: string;
}

/** Payload for updating a post (PATCH /careers/:id/) */
export interface UpdatePostPayload {
  title: string;
  content: string;
}
