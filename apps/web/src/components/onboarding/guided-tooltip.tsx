'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTooltipProps {
  steps: TooltipStep[];
  onComplete: () => void;
  onSkip?: () => void;
  isActive: boolean;
}

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect() : null;
}

function computeTooltipStyle(
  rect: DOMRect,
  position: 'top' | 'bottom' | 'left' | 'right',
): React.CSSProperties {
  const gap = 12;
  switch (position) {
    case 'top':
      return { left: rect.left + rect.width / 2, top: rect.top - gap, transform: 'translate(-50%, -100%)' };
    case 'bottom':
      return { left: rect.left + rect.width / 2, top: rect.bottom + gap, transform: 'translate(-50%, 0)' };
    case 'left':
      return { left: rect.left - gap, top: rect.top + rect.height / 2, transform: 'translate(-100%, -50%)' };
    case 'right':
      return { left: rect.right + gap, top: rect.top + rect.height / 2, transform: 'translate(0, -50%)' };
  }
}

export function GuidedTooltip({ steps, onComplete, onSkip, isActive }: GuidedTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number>();

  const step = steps[currentStep];

  const updateRect = useCallback(() => {
    if (!step) return;
    const rect = getRect(step.target);
    setTargetRect(rect);
    rafRef.current = requestAnimationFrame(updateRect);
  }, [step]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isActive || !step) return;
    updateRect();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, step, updateRect]);

  function next() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }

  function prev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  if (!isActive || !mounted || !step) return null;

  const position = step.position ?? 'bottom';
  const tooltipStyle = targetRect ? computeTooltipStyle(targetRect, position) : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };

  return createPortal(
    <>
      {/* Backdrop overlay with cutout */}
      <div className="fixed inset-0 z-[9998]" style={{ pointerEvents: 'none' }}>
        <svg className="w-full h-full">
          <defs>
            <mask id="tooltip-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 4}
                  y={targetRect.top - 4}
                  width={targetRect.width + 8}
                  height={targetRect.height + 8}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#tooltip-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring */}
      {targetRect && (
        <div
          className="fixed z-[9999] rounded-lg ring-2 ring-primary ring-offset-2 pointer-events-none animate-pulse"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-72 rounded-xl border bg-white p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2"
        style={{ ...tooltipStyle, position: 'fixed' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">{step.title}</h4>
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onSkip ?? onComplete}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prev}
                className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
              >
                ← Back
              </button>
            )}
            <button
              onClick={next}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
            >
              {currentStep === steps.length - 1 ? 'Done ✓' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/40' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}

/** Pre-built steps for the first-submission walkthrough */
export const FIRST_SUBMISSION_STEPS: TooltipStep[] = [
  {
    target: '[data-tour="select-topic"]',
    title: '📝 Choose a Topic',
    content: 'Browse trending topics or create your own. Each topic comes with guiding points to help structure your essay.',
    position: 'bottom',
  },
  {
    target: '[data-tour="write-essay"]',
    title: '✍️ Write or Upload',
    content: 'Type your essay directly in the editor, or upload photos of handwritten work. Our AI will handle the OCR!',
    position: 'bottom',
  },
  {
    target: '[data-tour="view-feedback"]',
    title: '📊 Get Instant Feedback',
    content: 'See your scores across 5 dimensions, detailed feedback, and a model rewrite to learn from. All aligned to the MOE rubric.',
    position: 'left',
  },
];
