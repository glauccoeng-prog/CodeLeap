/**
 * Root Layout
 *
 * Defines the global HTML structure, loads the Roboto font,
 * and wraps all pages with the Providers component.
 * Sets metadata for SEO and Open Graph sharing.
 */
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CodeLeap Network',
  description: 'A modern social network feed — CodeLeap Engineering Test',
  openGraph: {
    title: 'CodeLeap Network',
    description: "Share what's on your mind with the CodeLeap community.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
