import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { VariantProvider, type ClientVariantData } from '@/components/providers/variant-provider';
import { getVariantConfig, getWebVariantConfig } from '@/lib/variant';

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export async function generateMetadata(): Promise<Metadata> {
  const web = getWebVariantConfig();
  return {
    title: web.metaTitle,
    description: web.metaDescription,
    icons: {
      icon: '/favicon.png',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getVariantConfig();
  const web = getWebVariantConfig();

  const variantData: ClientVariantData = {
    variant: config.variant,
    productName: config.productName,
    levelLabels: config.levelLabels,
    authTagline: web.authTagline,
    footerTagline: web.footerTagline,
    registerTagline: web.registerTagline,
    registerFeatures: web.registerFeatures,
    pricingComparison: web.pricingComparison,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <VariantProvider value={variantData}>
          <QueryProvider>{children}</QueryProvider>
        </VariantProvider>
      </body>
    </html>
  );
}
