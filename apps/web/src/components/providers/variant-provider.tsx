'use client';

import { createContext, useContext } from 'react';

export interface ClientVariantData {
  variant: string;
  productName: string;
  levelLabels: Record<string, string>;
  authTagline: string;
  footerTagline: string;
  registerTagline: string;
  registerFeatures: { emoji: string; text: string }[];
  pricingComparison: string;
}

const VariantContext = createContext<ClientVariantData | null>(null);

export function VariantProvider({
  value,
  children,
}: {
  value: ClientVariantData;
  children: React.ReactNode;
}) {
  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}

export function useVariant() {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error('useVariant must be used within VariantProvider');
  return ctx;
}
