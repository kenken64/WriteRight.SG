'use client';

import { useState, useRef } from 'react';
import { useJoinClass } from '@/lib/api/client';

const CODE_LENGTH = 6;

export function JoinClassCard() {
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [success, setSuccess] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const joinClass = useJoinClass();

  const submitCode = (digits: string[]) => {
    const code = digits.join('').toUpperCase();
    if (code.length !== CODE_LENGTH) return;

    joinClass.mutate(
      { classCode: code },
      {
        onSuccess: (data) => {
          setSuccess(`Joined ${data.teacherName}'s class!`);
          setCodeDigits(Array(CODE_LENGTH).fill(''));
          setTimeout(() => setSuccess(null), 5000);
        },
      },
    );
  };

  const handleInputChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-HJ-NP-Z2-9]$/.test(char)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = char;
    setCodeDigits(newDigits);

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === CODE_LENGTH - 1 && newDigits.every(d => d)) {
      submitCode(newDigits);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      const newDigits = [...codeDigits];
      newDigits[index - 1] = '';
      setCodeDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '');
    const chars = pasted.slice(0, CODE_LENGTH).split('');
    const newDigits = [...codeDigits];
    chars.forEach((c, i) => { newDigits[i] = c; });
    setCodeDigits(newDigits);

    const nextIndex = Math.min(chars.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();

    if (newDigits.every(d => d) && newDigits.length === CODE_LENGTH) {
      submitCode(newDigits);
    }
  };

  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">Join a Class</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your teacher&apos;s 6-character class code to link your account.
      </p>

      <div className="mt-4 flex justify-center gap-2" onPaste={handlePaste}>
        {codeDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-12 w-10 rounded-lg border-2 text-center font-mono text-xl font-bold uppercase transition-all ${
              digit
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 focus:border-primary'
            } focus:outline-none focus:ring-2 focus:ring-primary/20`}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={() => submitCode(codeDigits)}
          disabled={!codeDigits.every(d => d) || joinClass.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {joinClass.isPending ? 'Joining...' : 'Join Class'}
        </button>
      </div>

      {success && <p className="mt-3 text-center text-sm text-green-600">{success}</p>}
      {joinClass.isError && (
        <p className="mt-3 text-center text-sm text-destructive">{joinClass.error.message}</p>
      )}
    </section>
  );
}
