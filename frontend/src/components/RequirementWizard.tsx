"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useForm,
  type FieldPath,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { ApiClientError, createRequirement } from "@/lib/api";
import { CATEGORY_META } from "@/lib/constants";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import {
  detailsSchemaByCategory,
  issuesToErrorMap,
  logisticsSchema,
  requirementSchema,
  stepOneSchema,
} from "@/lib/schemas";
import {
  emptyCategoryValues,
  emptyFormValues,
  type FormValues,
  type Requirement,
} from "@/lib/types";
import { formatDate, relativeTime } from "@/lib/utils";
import { CategoryBadge, Spinner } from "@/components/ui";
import { Stepper } from "@/components/Stepper";
import { StepBasics } from "@/components/steps/StepBasics";
import { StepDetails } from "@/components/steps/StepDetails";
import { StepLogistics } from "@/components/steps/StepLogistics";
import { StepReview } from "@/components/steps/StepReview";
import type { Bind } from "@/components/steps/types";

const LAST_STEP = 3;

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function RequirementWizard() {
  const form = useForm<FormValues>({ defaultValues: emptyFormValues() });
  const values = form.watch();
  const category = values.category;

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverDetails, setServerDetails] = useState<Array<{ path: string; message: string }> | null>(
    null,
  );
  const [created, setCreated] = useState<Requirement | null>(null);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const categoryRef = useRef<FormValues["category"]>("");
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /* Restore a locally saved draft once, on mount. */
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft.values);
      const safeStep = Math.min(LAST_STEP, Math.max(0, draft.step));
      categoryRef.current = draft.values.category ?? "";
      setStep(safeStep);
      setMaxStep(safeStep);
      setRestoredAt(draft.savedAt);
    }
    setHydrated(true);
  }, [form]);

  /* Keep a draft in localStorage so a refresh does not lose work. */
  useEffect(() => {
    if (!hydrated || created) return;

    const subscription = form.watch((next) => {
      saveDraft({
        values: next as FormValues,
        step: stepRef.current,
        savedAt: new Date().toISOString(),
      });
    });

    return () => subscription.unsubscribe();
  }, [form, hydrated, created]);

  /* Changing the category clears the other blocks so stale data can never be
     submitted, and seeds the newly selected block. */
  useEffect(() => {
    if (categoryRef.current === values.category) return;
    categoryRef.current = values.category;

    const seeded = values.category ? emptyCategoryValues(values.category) : {};

    form.setValue("planner", values.category === "planner" ? seeded.planner : undefined, {
      shouldDirty: true,
    });
    form.setValue("performer", values.category === "performer" ? seeded.performer : undefined, {
      shouldDirty: true,
    });
    form.setValue("crew", values.category === "crew" ? seeded.crew : undefined, {
      shouldDirty: true,
    });
    form.setValue("logistics.plannerContractType", undefined, { shouldDirty: true });
    form.setValue("logistics.performerSoundcheck", undefined, { shouldDirty: true });
    form.setValue("logistics.crewEquipmentProvided", undefined, { shouldDirty: true });
  }, [values.category, form]);

  const clearError = useCallback((path: string) => {
    setErrors((previous) => {
      if (!(path in previous)) return previous;
      const next = { ...previous };
      delete next[path];
      return next;
    });
  }, []);

  /* react-hook-form cannot type dotted paths through a helper, so the cast is
     contained here rather than repeated on every input. */
  const bind: Bind = (name, options = {}) =>
    form.register(name as FieldPath<FormValues>, {
      ...options,
      onChange: () => clearError(name),
    } as any) as UseFormRegisterReturn;

  const fail = (map: Record<string, string>, message?: string) => {
    setErrors(map);
    setSubmitError(message ?? "Please fix the highlighted fields.");
    setServerDetails(null);
    scrollToTop();
    return false;
  };

  const validateStep = (): boolean => {
    setSubmitError(null);
    setServerDetails(null);

    if (step === 0) {
      const result = stepOneSchema.safeParse({ category: values.category, basics: values.basics });
      if (!result.success) return fail(issuesToErrorMap(result.error.issues));
      return true;
    }

    if (step === 1) {
      if (!values.category) {
        setStep(0);
        return fail({ category: "Choose a category first" });
      }
      const result = detailsSchemaByCategory[values.category].safeParse(values[values.category]);
      if (!result.success) return fail(issuesToErrorMap(result.error.issues, values.category));
      return true;
    }

    if (step === 2) {
      const result = logisticsSchema.safeParse(values.logistics);
      if (!result.success) return fail(issuesToErrorMap(result.error.issues, "logistics"));
      return true;
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setErrors({});
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setMaxStep((current) => Math.max(current, next));
    scrollToTop();
  };

  const goBack = () => {
    setSubmitError(null);
    setStep((current) => Math.max(0, current - 1));
    scrollToTop();
  };

  const jumpTo = (target: number) => {
    if (target > maxStep) return;
    setSubmitError(null);
    setStep(target);
    scrollToTop();
  };

  const resetWizard = () => {
    clearDraft();
    categoryRef.current = "";
    form.reset(emptyFormValues());
    setStep(0);
    setMaxStep(0);
    setErrors({});
    setSubmitError(null);
    setServerDetails(null);
    setRestoredAt(null);
    setCreated(null);
    scrollToTop();
  };

  const submit = form.handleSubmit(async () => {
    const result = requirementSchema.safeParse(values);

    if (!result.success) {
      const map = issuesToErrorMap(result.error.issues);
      const firstPath = Object.keys(map)[0] ?? "";

      if (firstPath.startsWith("basics") || firstPath === "category") setStep(0);
      else if (firstPath.startsWith("logistics")) setStep(2);
      else setStep(1);

      setMaxStep(LAST_STEP);
      fail(map);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setServerDetails(null);

    try {
      const requirement = await createRequirement(result.data);
      clearDraft();
      setCreated(requirement);
      scrollToTop();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
        setServerDetails(error.details ?? null);
        if (error.details?.length) {
          setErrors(
            error.details.reduce<Record<string, string>>((accumulator, detail) => {
              if (!accumulator[detail.path]) accumulator[detail.path] = detail.message;
              return accumulator;
            }, {}),
          );
        }
      } else {
        setSubmitError("Something went wrong while submitting. Please try again.");
      }
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  });

  if (created) {
    return (
      <div className="max-w-xl">
        <p className="eyebrow">Saved</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
          Requirement submitted
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          <span className="font-medium text-stone-900">{created.basics.eventName}</span> was saved
          under{" "}
          <span className="inline-flex translate-y-0.5">
            <CategoryBadge category={created.category} />
          </span>
          .
        </p>

        <dl className="mt-6 border-t border-stone-200 text-sm">
          <div className="flex items-start justify-between gap-6 border-b border-stone-200 py-2.5">
            <dt className="text-stone-500">Requirement ID</dt>
            <dd className="break-all text-right font-mono text-xs text-stone-800">{created.id}</dd>
          </div>
          <div className="flex items-center justify-between gap-6 border-b border-stone-200 py-2.5">
            <dt className="text-stone-500">Responses by</dt>
            <dd className="text-stone-800">{formatDate(created.logistics.responseDeadline)}</dd>
          </div>
          <div className="flex items-center justify-between gap-6 border-b border-stone-200 py-2.5">
            <dt className="text-stone-500">Submitted</dt>
            <dd className="text-stone-800">{relativeTime(created.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/requirements" className="btn btn-primary">
            View all requirements
          </Link>
          <Link href={`/requirements/${created.id}`} className="btn btn-secondary">
            Open this requirement
          </Link>
          <button type="button" onClick={resetWizard} className="btn btn-ghost">
            Post another
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    "Event basics",
    category ? `${CATEGORY_META[category].label} details` : "Category details",
    "Logistics & contact",
    "Review & submit",
  ];

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
        <aside>
          <Stepper steps={steps} current={step} maxStep={maxStep} onSelect={jumpTo} />
        </aside>

        <div className="min-w-0 border border-stone-200 bg-white px-5 py-6 sm:px-7 sm:py-8">
          {restoredAt ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-l-2 border-stone-300 pl-3 text-[13px] text-stone-600">
              <span>Draft restored from {new Date(restoredAt).toLocaleString()}.</span>
              <button
                type="button"
                onClick={resetWizard}
                className="underline underline-offset-2 hover:text-stone-900"
              >
                Discard
              </button>
            </div>
          ) : null}

          {submitError || errorCount > 0 ? (
            <div role="alert" className="mb-6 border-l-2 border-rose-600 bg-rose-50 px-3.5 py-3">
              <p className="text-[13px] font-medium text-rose-900">
                {submitError ?? "Please fix the highlighted fields."}
              </p>
              {serverDetails?.length ? (
                <ul className="mt-1.5 space-y-0.5 text-xs text-rose-800">
                  {serverDetails.map((detail) => (
                    <li key={`${detail.path}-${detail.message}`}>
                      <span className="font-mono">{detail.path}</span>: {detail.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div key={step}>
            {step === 0 ? (
              <StepBasics form={form} bind={bind} clearError={clearError} errors={errors} />
            ) : null}
            {step === 1 ? (
              <StepDetails form={form} bind={bind} clearError={clearError} errors={errors} />
            ) : null}
            {step === 2 ? (
              <StepLogistics form={form} bind={bind} clearError={clearError} errors={errors} />
            ) : null}
            {step === LAST_STEP ? (
              <StepReview values={values} onEdit={jumpTo} />
            ) : null}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0 || submitting}
                className="btn btn-ghost"
              >
                Back
              </button>
              {hydrated ? (
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.09em] text-stone-400 sm:inline">
                  Draft saved locally
                </span>
              ) : null}
            </div>

            {step < LAST_STEP ? (
              <button type="button" onClick={goNext} className="btn btn-primary">
                Continue
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? (
                  <>
                    <Spinner /> Submitting…
                  </>
                ) : (
                  "Submit requirement"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
