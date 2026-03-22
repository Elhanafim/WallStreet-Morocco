import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'WallStreet Morocco — Investir au Maroc',
    template: '%s | WallStreet Morocco',
  },
  description:
    'La plateforme de référence pour les investisseurs marocains. Analyses de la Bourse de Casablanca, OPCVM, simulateur de portefeuille, calendrier économique et guides en français.',
  keywords: [
    'bourse casablanca',
    'investissement maroc',
    'OPCVM maroc',
    'MASI MADEX',
    'actions maroc',
    'finance maroc',
    'investir maroc',
  ],
  authors: [{ name: 'El Hanafi Mohammed' }],
  creator: 'WallStreet Morocco',
  metadataBase: new URL('https://wallstreetmorocco.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://wallstreetmorocco.com',
    title: 'WallStreet Morocco — Investir au Maroc',
    description: 'La plateforme de référence pour les investisseurs marocains.',
    siteName: 'WallStreet Morocco',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WallStreet Morocco',
    description: 'Investissez intelligemment au Maroc',
    creator: '@wallstreetma',
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
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
