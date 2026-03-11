/**
 * 404 Not Found Page
 *
 * Displayed when the user navigates to a route that doesn't exist.
 * Shows a friendly message with a link back to the home page.
 */
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#999] rounded-2xl p-10 text-center shadow-lg">
        <p className="text-6xl mb-4" aria-hidden="true">
          🔍
        </p>
        <h2 className="text-heading-xl font-bold text-[#111827] mb-2">Page not found</h2>
        <p className="text-body text-[#9ca3af] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors duration-150"
        >
          <Home size={16} aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
