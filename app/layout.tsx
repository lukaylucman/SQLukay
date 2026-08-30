import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SQLukay',
  description: 'An elegant database workspace.',
  icons: {
    icon: '/logo-sqlukay.png',
    apple: '/logo-sqlukay.png',
  },
  openGraph: {
    title: 'SQLukay',
    description: 'An elegant database workspace.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SQLukay',
    description: 'An elegant database workspace.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
