import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { FormValues } from "@/lib/types";

/**
 * react-hook-form cannot infer dotted paths through a generic helper, so the
 * binding helper is typed loosely here and cast once in the wizard.
 */
export type Bind = (
  name: string,
  options?: { valueAsNumber?: boolean },
) => UseFormRegisterReturn;

export interface StepProps {
  form: UseFormReturn<FormValues>;
  bind: Bind;
  clearError: (path: string) => void;
  errors: Record<string, string>;
}
