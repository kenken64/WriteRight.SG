'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentOnboard } from '@/lib/api/client';
import { BookOpen, GraduationCap, PenTool, Check, Copy, ArrowRight } from 'lucide-react';

type Step = 'welcome' | 'level' | 'success';
type Level = 'sec3' | 'sec4' | 'sec5';

const levels: { value: Level; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'sec3', label: 'Secondary 3', description: 'Building strong essay foundations', icon: BookOpen },
  { value: 'sec4', label: 'Secondary 4', description: 'Preparing for English exams', icon: PenTool },
  { value: 'sec5', label: 'Secondary 5', description: 'Advanced exam preparation', icon: GraduationCap },
];

interface Props {
  displayName: string;
}

export function StudentOnboardFlow({ displayName }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const router = useRouter();
  const onboard = useStudentOnboard();

  useEffect(() => {
    if (step === 'success') {
      setConfetti(true);
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleLevelSelect = async () => {
    if (!selectedLevel) return;

    onboard.mutate(
      { level: selectedLevel, displayName },
      {
        onSuccess: (data) => {
          setInviteCode(data.inviteCode);
          setStep('success');
        },
      },
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Confetti overlay */}
      {confetti && (
        <div className="pointer-events-none absolute inset-0 -top-20 z-10 flex justify-center">
          <div className="text-5xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {(['welcome', 'level', 'success'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              s === step ? 'w-8 bg-primary' : i < ['welcome', 'level', 'success'].indexOf(step) ? 'w-2.5 bg-primary/60' : 'w-2.5 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border bg-white p-8 shadow-sm transition-all duration-300">
        {step === 'welcome' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <PenTool className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Welcome, {displayName}!</h2>
            <p className="mt-3 text-muted-foreground">
              Let&apos;s set up your account so you can start improving your English essays with AI-powered feedback.
            </p>
            <button
              onClick={() => setStep('level')}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 'level' && (
          <div>
            <h2 className="text-xl font-bold text-center">What level are you in?</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              This helps us tailor essay prompts and rubrics to your syllabus.
            </p>

            <div className="mt-6 space-y-3">
              {levels.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedLevel(value)}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                    selectedLevel === value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    selectedLevel === value ? 'bg-primary/10' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${selectedLevel === value ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                  </div>
                  {selectedLevel === value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleLevelSelect}
              disabled={!selectedLevel || onboard.isPending}
              className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {onboard.isPending ? 'Setting up...' : 'Continue'}
            </button>

            {onboard.isError && (
              <p className="mt-3 text-center text-sm text-destructive">{onboard.error.message}</p>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
            <p className="mt-3 text-muted-foreground">
              Share this invite code with your parent so they can link their account to yours.
            </p>

            <div className="mt-6 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Invite Code</p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">
                  {inviteCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded-md p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              {copied && <p className="mt-2 text-xs text-green-600">Copied to clipboard!</p>}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              You can always find this code later on your Settings page.
            </p>

            <button
              onClick={() => {
                router.push('/assignments');
                router.refresh();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
