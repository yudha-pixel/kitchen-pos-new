'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface FormStatusBarStep {
  key: string;
  label: string;
}

export interface FormStatusBarProps {
  steps: FormStatusBarStep[];
  activeKey: string;
  className?: string;
  maxVisible?: number;
}

export function FormStatusBar({ steps, activeKey, className = '', maxVisible = 2 }: FormStatusBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const normActiveKey = (activeKey || '').toLowerCase();

  const getStepIndex = (key: string) => {
    const k = key.toLowerCase();
    const idx = steps.findIndex(s => s.key.toLowerCase() === k || k.includes(s.key.toLowerCase()));
    return idx >= 0 ? idx : 0;
  };

  const currentIdx = getStepIndex(normActiveKey);

  // Compute 2 visible steps around active step
  let visibleIndices: number[] = [];
  if (steps.length <= maxVisible) {
    visibleIndices = steps.map((_, i) => i);
  } else if (currentIdx === 0) {
    visibleIndices = [0, 1];
  } else if (currentIdx === steps.length - 1) {
    visibleIndices = [steps.length - 2, steps.length - 1];
  } else {
    visibleIndices = [currentIdx, currentIdx + 1];
  }

  return (
    <div className={`relative flex items-center gap-1.5 bg-surface-alt p-1.5 rounded-lg border border-line text-xs font-semibold shrink-0 ${className}`}>
      {/* Max 2 Visible Steps */}
      <div className="flex items-center gap-1">
        {visibleIndices.map((stepIdx, i) => {
          const step = steps[stepIdx];
          const isCompleted = stepIdx < currentIdx;
          const isCurrent = stepIdx === currentIdx;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  isCurrent
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-ink-muted opacity-70'
                }`}
              >
                {isCompleted && <Check className="h-3.5 w-3.5" />}
                <span>{step.label}</span>
              </div>
              {i < visibleIndices.length - 1 && (
                <span className="text-ink-muted px-1 opacity-40">&rsaquo;</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Flow Dropdown Trigger Button (Icon Only) */}
      {steps.length > maxVisible && (
        <div className="relative border-l border-line pl-1 flex items-center">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-1 rounded-md bg-surface border border-line hover:bg-surface-alt transition-colors text-ink-muted hover:text-ink"
            title="Lihat Seluruh Alur Workflow"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-primary' : ''}`} />
          </button>

          {/* Dropdown Popup Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-surface border border-line rounded-xl shadow-2xl z-40 p-2 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-line flex items-center justify-between">
                <span>Seluruh Tahap Workflow</span>
                <span className="font-mono text-primary">{currentIdx + 1} / {steps.length}</span>
              </div>

              {steps.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-primary-soft text-primary font-bold border border-primary/20'
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-ink-muted hover:bg-surface-alt'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-surface border border-line font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{step.label}</span>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-bold uppercase">
                        Aktif
                      </span>
                    )}
                    {isCompleted && <Check className="h-4 w-4 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
