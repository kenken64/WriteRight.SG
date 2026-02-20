import Link from 'next/link';
import { getVariantConfig } from '@/lib/variant';

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  const { productName } = getVariantConfig();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-6">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          {productName}
        </Link>
      </div>
      {children}
    </div>
  );
}
