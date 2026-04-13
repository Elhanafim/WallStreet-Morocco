import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: {
    default: 'WallStreet Morocco — Casablanca Stock Exchange Intelligence',
    template: '%s | WallStreet Morocco',
  },
  description:
    'Real-time market data, portfolio analytics, and institutional-grade research tools for investors on the Bourse de Casablanca. Educational platform — not investment advice.',
  keywords: [
    'Casablanca stock exchange',
    'Bourse de Casablanca',
    'MASI MADEX Morocco',
    'OPCVM Morocco funds',
    'Morocco investing',
    'Moroccan stocks',
    'BVC market data',
    'Morocco finance',
  ],
  authors: [{ name: 'WallStreet Morocco' }],
  creator: 'WallStreet Morocco',
  metadataBase: new URL('https://wallstreetmorocco.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wallstreetmorocco.com',
    title: 'WallStreet Morocco — Casablanca Stock Exchange Intelligence',
    description: 'Real-time market data and research tools for the Bourse de Casablanca.',
    siteName: 'WallStreet Morocco',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WallStreet Morocco',
    description: 'Casablanca Stock Exchange — Real-time market intelligence',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Light is the canonical mode — no flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('wsm-theme');document.documentElement.setAttribute('data-theme',t||'light');})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
