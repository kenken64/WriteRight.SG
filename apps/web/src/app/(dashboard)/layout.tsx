import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = (user.user_metadata?.role as 'parent' | 'student') ?? 'parent';

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role={role} userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-x-hidden bg-muted/30">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
          {/* Spacer for hamburger button */}
          <div className="w-10" />
          <h1 className="flex-1 text-center text-lg font-bold text-primary">WriteRight SG</h1>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
            {role}
          </span>
        </div>
        <div className="px-4 py-4 md:px-8 md:py-6">{children}</div>
      </main>
    </div>
  );
}
