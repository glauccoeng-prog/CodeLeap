/**
 * Error Boundary Page
 *
 * Next.js error boundary that catches runtime errors in the app.
 * Displays a user-friendly error message with a "Try again" button
 * that resets the error boundary.
 */
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#999] rounded-2xl p-10 text-center shadow-lg">
        <p className="text-5xl mb-4" aria-hidden="true">
          ⚠️
        </p>
        <h2 className="text-heading font-bold text-[#111827] mb-2">Something went wrong</h2>
        <p className="text-body text-[#9ca3af] mb-8">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors duration-150"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
