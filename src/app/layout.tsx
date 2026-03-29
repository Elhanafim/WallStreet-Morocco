import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: {
    default: 'WallStreet Morocco — Comprendre la Bourse de Casablanca',
    template: '%s | WallStreet Morocco',
  },
  description:
    'Outil éducatif sur la Bourse de Casablanca. Données BVC, analyses sectorielles, OPCVM, simulateur de portefeuille et guides pédagogiques. Site éducatif uniquement — pas un conseil en investissement.',
  keywords: [
    'bourse casablanca éducatif',
    'apprendre bourse maroc',
    'OPCVM maroc',
    'MASI MADEX',
    'finance maroc',
    'éducation financière maroc',
    'BVC données',
  ],
  authors: [{ name: 'El Hanafi Mohammed' }],
  creator: 'WallStreet Morocco',
  metadataBase: new URL('https://wallstreetmorocco.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://wallstreetmorocco.com',
    title: 'WallStreet Morocco — Comprendre la Bourse de Casablanca',
    description: 'Outil éducatif sur la Bourse de Casablanca. Site éducatif uniquement — pas un conseil en investissement.',
    siteName: 'WallStreet Morocco',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WallStreet Morocco',
    description: 'Comprendre la Bourse de Casablanca — Outil éducatif',
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
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-primary">
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
