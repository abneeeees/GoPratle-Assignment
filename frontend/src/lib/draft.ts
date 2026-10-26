import type { FormValues } from "./types";

const KEY = "gopratle:requirement-draft:v1";

export interface Draft {
  values: FormValues;
  step: number;
  savedAt: string;
}

export function saveDraft(draft: Draft): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Private mode / quota exceeded — drafts are a convenience, never a blocker.
  }
}

export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (!parsed?.values || typeof parsed.step !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
