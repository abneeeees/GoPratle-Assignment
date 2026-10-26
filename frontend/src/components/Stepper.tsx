"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  current: number;
  maxStep: number;
  onSelect: (index: number) => void;
}

export function Stepper({ steps, current, maxStep, onSelect }: StepperProps) {
  return (
    <>
      {/* Mobile: compact progress */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-stone-500">
            Step {current + 1} / {steps.length}
          </span>
          <span className="text-[13px] font-medium text-stone-900">{steps[current]}</span>
        </div>
        <div className="mt-2 h-0.5 w-full overflow-hidden bg-stone-200">
          <div
            className="h-full bg-stone-900 transition-all"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: vertical rail */}
      <ol className="hidden border-l border-stone-200 lg:block">
        {steps.map((title, index) => {
          const isActive = index === current;
          const reachable = index <= maxStep;

          return (
            <li key={title}>
              <button
                type="button"
                onClick={() => reachable && onSelect(index)}
                disabled={!reachable || isActive}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "-ml-px flex w-full items-baseline gap-3 border-l-2 py-2 pl-4 pr-2 text-left text-[13px] transition-colors",
                  isActive && "border-stone-900 text-stone-900",
                  !isActive && reachable && "border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900",
                  !isActive && !reachable && "cursor-not-allowed border-transparent text-stone-400",
                )}
              >
                <span className="font-mono text-[10px] text-stone-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={cn(isActive && "font-medium")}>{title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
