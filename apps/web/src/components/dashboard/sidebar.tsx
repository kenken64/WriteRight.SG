'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavForRole, type UserRole } from '@/lib/utils/roles';
import {
  ClipboardList, FileText, Lightbulb, Trophy, Star, Medal,
  Gift, BarChart3, Settings, LogOut,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'clipboard-list': ClipboardList,
  'file-text': FileText,
  'lightbulb': Lightbulb,
  'trophy': Trophy,
  'star': Star,
  'medal': Medal,
  'gift': Gift,
  'bar-chart-3': BarChart3,
  'settings': Settings,
};

interface SidebarProps {
  role: UserRole;
  userEmail: string;
}

export function DashboardSidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="border-b p-4">
        <Link href="/" className="text-xl font-bold text-primary">
          WriteRight SG
        </Link>
        <p className="mt-1 truncate text-xs text-muted-foreground">{userEmail}</p>
        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
          {role}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] ?? ClipboardList;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
