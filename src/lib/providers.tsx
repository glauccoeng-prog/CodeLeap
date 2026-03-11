/**
 * Providers Component
 *
 * Root provider wrapper that sets up:
 *  - TanStack React Query (data fetching, caching, infinite scroll)
 *  - AuthProvider (Firebase or simple auth)
 *  - Sonner toast notifications (bottom-right position)
 *  - React Query DevTools (development only)
 */
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

import { useState } from 'react';

/** Creates a QueryClient instance with sensible defaults for this app */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: { fontFamily: 'var(--font-roboto, Roboto, sans-serif)' },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
