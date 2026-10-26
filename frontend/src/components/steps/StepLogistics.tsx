"use client";

import { BUDGET_FLEXIBILITY, CATEGORY_META, PLANNER_CONTRACT_TYPES } from "@/lib/constants";
import { today } from "@/lib/schemas";
import {
  Field,
  Input,
  SectionHeading,
  Select,
  Textarea,
  Toggle,
} from "@/components/ui";
import type { StepProps } from "./types";

/**
 * Step 3 is also category-aware: one extra question changes with the category,
 * and the copy adapts. Everything else (deadline, contact, notes) is common.
 */
export function StepLogistics({ form, bind, clearError, errors }: StepProps) {
  const category = form.watch("category");
  const meta = category ? CATEGORY_META[category] : null;

  return (
    <div className="space-y-6">
      <SectionHeading
        step="Step 3 of 4"
        title="Logistics & contact"
        subtitle="How quickly you need responses, and who should receive them."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Response deadline"
          htmlFor="response-deadline"
          required
          error={errors["logistics.responseDeadline"]}
          hint="The last date you want to receive applications."
        >
          <Input
            id="response-deadline"
            type="date"
            min={today()}
            invalid={Boolean(errors["logistics.responseDeadline"])}
            {...bind("logistics.responseDeadline")}
          />
        </Field>

        <Field
          label="Budget flexibility"
          htmlFor="budget-flexibility"
          required
          error={errors["logistics.budgetFlexibility"]}
        >
          <Select
            id="budget-flexibility"
            invalid={Boolean(errors["logistics.budgetFlexibility"])}
            {...bind("logistics.budgetFlexibility")}
          >
            <option value="">Select flexibility</option>
            {BUDGET_FLEXIBILITY.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Toggle
            label="Travel and stay are covered"
            description="Leave off if the vendor has to arrange their own travel."
            checked={form.watch("logistics.travelCovered") ?? false}
            onChange={(checked) => {
              form.setValue("logistics.travelCovered", checked, { shouldDirty: true });
              clearError("logistics.travelCovered");
            }}
          />
        </div>

        {category === "planner" ? (
          <Field
            label="Engagement type"
            htmlFor="contract-type"
            className="sm:col-span-2"
            error={errors["logistics.plannerContractType"]}
          >
            <Select
              id="contract-type"
              invalid={Boolean(errors["logistics.plannerContractType"])}
              {...bind("logistics.plannerContractType")}
            >
              <option value="">Select an engagement</option>
              {PLANNER_CONTRACT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        {category === "performer" ? (
          <div className="sm:col-span-2">
            <Toggle
              label="Soundcheck is required"
              description="Performer must be available before doors open."
              checked={form.watch("logistics.performerSoundcheck") ?? false}
              onChange={(checked) => {
                form.setValue("logistics.performerSoundcheck", checked, { shouldDirty: true });
                clearError("logistics.performerSoundcheck");
              }}
            />
          </div>
        ) : null}

        {category === "crew" ? (
          <div className="sm:col-span-2">
            <Toggle
              label="Production equipment is provided"
              description="Turn on if gear is supplied on site."
              checked={form.watch("logistics.crewEquipmentProvided") ?? false}
              onChange={(checked) => {
                form.setValue("logistics.crewEquipmentProvided", checked, { shouldDirty: true });
                clearError("logistics.crewEquipmentProvided");
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="border-t border-stone-200 pt-6">
        <SectionHeading title="Contact" subtitle="Shared with the people who apply." />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Contact name"
            htmlFor="contact-name"
            required
            error={errors["logistics.contactName"]}
          >
            <Input
              id="contact-name"
              autoComplete="name"
              placeholder="Rohit Sharma"
              invalid={Boolean(errors["logistics.contactName"])}
              {...bind("logistics.contactName")}
            />
          </Field>

          <Field
            label="Contact email"
            htmlFor="contact-email"
            required
            error={errors["logistics.contactEmail"]}
          >
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              invalid={Boolean(errors["logistics.contactEmail"])}
              {...bind("logistics.contactEmail")}
            />
          </Field>

          <Field
            label="Contact phone"
            htmlFor="contact-phone"
            error={errors["logistics.contactPhone"]}
          >
            <Input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              invalid={Boolean(errors["logistics.contactPhone"])}
              {...bind("logistics.contactPhone")}
            />
          </Field>

          <Field
            label="Anything else?"
            htmlFor="notes"
            className="sm:col-span-2"
            error={errors["logistics.notes"]}
            hint={`${meta?.label ?? "Category"} specific notes, must-haves or constraints.`}
          >
            <Textarea
              id="notes"
              rows={4}
              maxLength={2000}
              placeholder="Add context that would help someone decide quickly. Eg. outdoor stage, load-in from 6am..."
              invalid={Boolean(errors["logistics.notes"])}
              {...bind("logistics.notes")}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
