'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InviteCodeCard } from '@/components/dashboard/invite-code-card';
import { readCsrfToken } from '@/lib/hooks/use-csrf-token';

interface Settings {
  displayName: string;
  email: string;
  notificationPrefs: { email: boolean; push: boolean };
  role: string;
}

async function fetchSettings(): Promise<Settings> {
  const res = await fetch('/api/v1/settings');
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

async function saveSettings(data: { displayName?: string; notificationPrefs?: { email: boolean; push: boolean } }) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const csrfToken = readCsrfToken();
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  const res = await fetch('/api/v1/settings', {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Save failed' }));
    throw new Error(err.error || 'Save failed');
  }
  return res.json();
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });

  const [displayName, setDisplayName] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName);
      setEmailNotifs(settings.notificationPrefs.email);
      setPushNotifs(settings.notificationPrefs.push);
    }
  }, [settings]);

  const handleSave = () => {
    mutation.mutate({
      displayName,
      notificationPrefs: { email: emailNotifs, push: pushNotifs },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-8 space-y-8">
          <div className="h-40 animate-pulse rounded-lg border bg-gray-50" />
          <div className="h-32 animate-pulse rounded-lg border bg-gray-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="mt-8 space-y-8">
        {/* Profile */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={settings?.email ?? ''}
                className="mt-1 w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-muted-foreground"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Invite Code (students only) */}
        {settings?.role === 'student' && <InviteCodeCard />}

        {/* Notifications */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-4 w-4 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Push notifications</span>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="h-4 w-4 rounded"
              />
            </label>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          {saveSuccess && <span className="text-sm text-green-600">Settings saved!</span>}
          {mutation.isError && <span className="text-sm text-destructive">{mutation.error.message}</span>}
        </div>

        {/* Billing */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="mt-2 text-sm text-muted-foreground">Current plan: Free</p>
          <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">
            Upgrade to WriteRight Plus
          </button>
        </section>
      </div>
    </div>
  );
}
