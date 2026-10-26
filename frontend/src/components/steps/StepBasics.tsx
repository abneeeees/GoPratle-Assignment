"use client";

import { CATEGORIES, CATEGORY_META, DATE_MODES, EVENT_TYPES } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import { today } from "@/lib/schemas";
import {
  ChoiceCards,
  Field,
  Input,
  SectionHeading,
  Segmented,
  Select,
} from "@/components/ui";
import type { StepProps } from "./types";

export function StepBasics({ form, bind, clearError, errors }: StepProps) {
  const dateMode = form.watch("basics.dateMode");
  const category = form.watch("category");
  const startDate = form.watch("basics.startDate");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeading
          step="Step 1 of 4"
          title="Event basics"
          subtitle="What is happening, when and where."
        />

        <Field
          label="Event name"
          htmlFor="event-name"
          required
          error={errors["basics.eventName"]}
        >
          <Input
            id="event-name"
            placeholder="e.g. Mehta–Rao Wedding"
            autoComplete="off"
            invalid={Boolean(errors["basics.eventName"])}
            {...bind("basics.eventName")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event type" htmlFor="event-type" required error={errors["basics.eventType"]}>
            <Select
              id="event-type"
              invalid={Boolean(errors["basics.eventType"])}
              {...bind("basics.eventType")}
            >
              <option value="">Select an event type</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Venue" htmlFor="venue" error={errors["basics.venue"]}>
            <Input
              id="venue"
              placeholder="e.g. The Leela Palace"
              invalid={Boolean(errors["basics.venue"])}
              {...bind("basics.venue")}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-stone-200 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-stone-700">Event dates</p>
            {errors["basics.dateMode"] ? (
              <p className="text-xs text-rose-700">{errors["basics.dateMode"]}</p>
            ) : null}
          </div>
          <Segmented
            name="Date type"
            value={dateMode}
            options={[
              { value: DATE_MODES[0], label: "Single day" },
              { value: DATE_MODES[1], label: "Date range" },
            ]}
            onChange={(mode) => {
              form.setValue("basics.dateMode", mode, { shouldDirty: true });
              if (mode === "single") {
                form.setValue("basics.endDate", "", { shouldDirty: true });
              }
              clearError("basics.dateMode");
              clearError("basics.endDate");
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Start date"
            htmlFor="start-date"
            required
            error={errors["basics.startDate"]}
          >
            <Input
              id="start-date"
              type="date"
              min={today()}
              invalid={Boolean(errors["basics.startDate"])}
              {...bind("basics.startDate")}
            />
          </Field>

          {dateMode === "range" ? (
            <Field label="End date" htmlFor="end-date" required error={errors["basics.endDate"]}>
              <Input
                id="end-date"
                type="date"
                min={startDate || today()}
                invalid={Boolean(errors["basics.endDate"])}
                {...bind("basics.endDate")}
              />
            </Field>
          ) : (
            <div className="hidden sm:block" aria-hidden />
          )}
        </div>
      </section>

      <section className="space-y-4 border-t border-stone-200 pt-6">
        <SectionHeading title="Location" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" htmlFor="city" required error={errors["basics.city"]}>
            <Input
              id="city"
              placeholder="Bengaluru"
              invalid={Boolean(errors["basics.city"])}
              {...bind("basics.city")}
            />
          </Field>
          <Field label="State" htmlFor="state" error={errors["basics.state"]}>
            <Input
              id="state"
              placeholder="Karnataka"
              invalid={Boolean(errors["basics.state"])}
              {...bind("basics.state")}
            />
          </Field>
          <Field label="Country" htmlFor="country" required error={errors["basics.country"]}>
            <Input
              id="country"
              placeholder="India"
              invalid={Boolean(errors["basics.country"])}
              {...bind("basics.country")}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-stone-200 pt-6">
        <SectionHeading title="Who are you hiring?" subtitle="This selects the fields shown next." />
        <ChoiceCards<Category>
          value={category}
          invalid={Boolean(errors.category)}
          onChange={(next) => {
            form.setValue("category", next, { shouldDirty: true });
            clearError("category");
          }}
          options={CATEGORIES.map((value) => ({
            value,
            title: CATEGORY_META[value].label,
            description: CATEGORY_META[value].description,
          }))}
        />
        {errors.category ? (
          <p className="text-xs text-rose-700" role="alert">
            {errors.category}
          </p>
        ) : null}
      </section>
    </div>
  );
}
