/**
 * HomePage
 *
 * Main entry point of the application.
 * Renders a loading spinner while auth state is being resolved,
 * the LoginModal if user is not authenticated,
 * or the full feed (header + create form + post list) if authenticated.
 */
'use client';
import { LoginModal } from '@/components/auth/LoginModal';
import { AppHeader } from '@/components/feed/AppHeader';
import { CreatePostForm } from '@/components/feed/CreatePostForm';
import { PostList } from '@/components/feed/PostList';

import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <AppHeader />
      <main className="max-w-200 mx-auto px-6 py-6">
        <CreatePostForm />
        <PostList />
      </main>
    </div>
  );
}
