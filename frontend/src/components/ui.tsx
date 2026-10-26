"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded border bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-stone-100";

const controlTone = (invalid?: boolean) =>
  invalid
    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
    : "border-stone-300 focus:ring-stone-200";

export const inputClass = (invalid?: boolean) => cn(controlBase, controlTone(invalid));

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-stone-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-stone-400" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(inputClass(invalid), className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(inputClass(invalid), "pr-8", className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(inputClass(invalid), "min-h-[104px] resize-y", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

interface SegmentedProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export function Segmented<T extends string>({ options, value, onChange, name }: SegmentedProps<T>) {
  return (
    <div
      className="inline-flex rounded border border-stone-300 bg-white p-0.5"
      role="group"
      aria-label={name}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[3px] px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface ChipGroupProps {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
}

export function ChipGroup({ options, value, onChange, invalid }: ChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", invalid && "rounded")}>
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(active ? value.filter((item) => item !== option) : [...value, option])
            }
            className={cn(
              "rounded border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded border border-stone-300 bg-white px-3.5 py-3 text-left transition-colors hover:border-stone-400"
    >
      <span className="space-y-0.5">
        <span className="block text-[13px] font-medium text-stone-800">{label}</span>
        {description ? (
          <span className="block text-xs leading-relaxed text-stone-500">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-stone-900" : "bg-stone-300",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

interface ChoiceCardsProps<T extends string> {
  options: Array<{ value: T; title: string; description: string }>;
  value: T | "";
  onChange: (value: T) => void;
  invalid?: boolean;
}

export function ChoiceCards<T extends string>({
  options,
  value,
  onChange,
  invalid,
}: ChoiceCardsProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:grid-cols-3",
        invalid && "rounded ring-1 ring-rose-300 ring-offset-2",
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-start gap-3 rounded border p-3 text-left transition-colors",
              active
                ? "border-stone-900 bg-stone-50"
                : "border-stone-300 bg-white hover:border-stone-400",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                active ? "border-stone-900" : "border-stone-400",
              )}
            >
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-stone-900" /> : null}
            </span>
            <span>
              <span className="block text-[13px] font-medium text-stone-900">{option.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  step,
}: {
  title: string;
  subtitle?: string;
  step?: string;
}) {
  return (
    <div>
      {step ? <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-stone-400">{step}</p> : null}
      <h2 className="mt-1 text-base font-semibold tracking-tight text-stone-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-stone-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function CategoryBadge({ category }: { category: "planner" | "performer" | "crew" }) {
  const dots = {
    planner: "bg-sky-600",
    performer: "bg-amber-600",
    crew: "bg-emerald-600",
  } as const;
  const labels = { planner: "Planner", performer: "Performer", crew: "Crew" } as const;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700">
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[category])} aria-hidden />
      {labels[category]}
    </span>
  );
}
