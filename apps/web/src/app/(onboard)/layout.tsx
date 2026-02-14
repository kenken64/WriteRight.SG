import Link from 'next/link';

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-6">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          WriteRight SG
        </Link>
      </div>
      {children}
    </div>
  );
}
