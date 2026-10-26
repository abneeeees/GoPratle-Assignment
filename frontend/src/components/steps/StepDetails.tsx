"use client";

import {
  CATEGORY_META,
  CREW_ROLES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
  SKILL_LEVELS,
} from "@/lib/constants";
import {
  ChipGroup,
  Field,
  Input,
  SectionHeading,
  Select,
  Toggle,
} from "@/components/ui";
import type { StepProps } from "./types";

/**
 * Steps 2 and 3 are category-aware. This file is the "step 2" half: the
 * fields that only make sense for the selected category.
 */
export function StepDetails({ form, bind, clearError, errors }: StepProps) {
  const category = form.watch("category");

  if (!category) {
    return (
      <div className="rounded border border-stone-300 bg-stone-50 px-4 py-6 text-center">
        <p className="text-sm text-stone-700">Pick a category in step 1 first.</p>
      </div>
    );
  }

  const meta = CATEGORY_META[category];
  const services = form.watch("planner.services") ?? [];

  return (
    <div className="space-y-6">
      <SectionHeading
        step="Step 2 of 4"
        title={`${meta.label} details`}
        subtitle={
          category === "planner"
            ? "Scope, budget and the services you need handled."
            : category === "performer"
              ? "The act, the set and what they bring."
              : "The role, the shift and the rate."
        }
      />

      {category === "planner" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Number of guests"
            htmlFor="guest-count"
            required
            error={errors["planner.guestCount"]}
          >
            <Input
              id="guest-count"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              placeholder="250"
              invalid={Boolean(errors["planner.guestCount"])}
              {...bind("planner.guestCount", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Planner experience"
            htmlFor="planner-experience"
            required
            error={errors["planner.experienceLevel"]}
          >
            <Select
              id="planner-experience"
              invalid={Boolean(errors["planner.experienceLevel"])}
              {...bind("planner.experienceLevel")}
            >
              <option value="">Select a level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Minimum budget (INR)"
            htmlFor="budget-min"
            required
            error={errors["planner.budgetMin"]}
          >
            <Input
              id="budget-min"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              placeholder="300000"
              invalid={Boolean(errors["planner.budgetMin"])}
              {...bind("planner.budgetMin", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Maximum budget (INR)"
            htmlFor="budget-max"
            required
            error={errors["planner.budgetMax"]}
          >
            <Input
              id="budget-max"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              placeholder="500000"
              invalid={Boolean(errors["planner.budgetMax"])}
              {...bind("planner.budgetMax", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Services needed"
            required
            className="sm:col-span-2"
            error={errors["planner.services"]}
            hint="Select everything the planner should own."
          >
            <ChipGroup
              options={PLANNER_SERVICES}
              value={services}
              invalid={Boolean(errors["planner.services"])}
              onChange={(next) => {
                form.setValue("planner.services", next, { shouldDirty: true });
                clearError("planner.services");
              }}
            />
          </Field>
        </div>
      ) : null}

      {category === "performer" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Performer type"
            htmlFor="performer-type"
            required
            error={errors["performer.performerType"]}
          >
            <Select
              id="performer-type"
              invalid={Boolean(errors["performer.performerType"])}
              {...bind("performer.performerType")}
            >
              <option value="">Select an act</option>
              {PERFORMER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Genre / style"
            htmlFor="genre"
            required
            error={errors["performer.genre"]}
          >
            <Input
              id="genre"
              placeholder="e.g. Bollywood covers, deep house"
              invalid={Boolean(errors["performer.genre"])}
              {...bind("performer.genre")}
            />
          </Field>

          <Field
            label="Set length (minutes)"
            htmlFor="set-duration"
            required
            error={errors["performer.setDurationMinutes"]}
          >
            <Input
              id="set-duration"
              type="number"
              min={5}
              max={1440}
              step={5}
              inputMode="numeric"
              placeholder="90"
              invalid={Boolean(errors["performer.setDurationMinutes"])}
              {...bind("performer.setDurationMinutes", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Fee expectation (INR)"
            htmlFor="fee"
            required
            error={errors["performer.feeExpectation"]}
          >
            <Input
              id="fee"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              placeholder="75000"
              invalid={Boolean(errors["performer.feeExpectation"])}
              {...bind("performer.feeExpectation", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Portfolio / sample link"
            htmlFor="portfolio"
            className="sm:col-span-2"
            error={errors["performer.portfolioUrl"]}
            hint="A YouTube, Instagram or website link helps you get better responses."
          >
            <Input
              id="portfolio"
              type="url"
              placeholder="https://"
              invalid={Boolean(errors["performer.portfolioUrl"])}
              {...bind("performer.portfolioUrl")}
            />
          </Field>

          <div className="sm:col-span-2">
            <Toggle
              label="Performer brings their own equipment"
              description="Sound, instruments or decks included in the fee."
              checked={form.watch("performer.ownEquipment") ?? false}
              onChange={(checked) => {
                form.setValue("performer.ownEquipment", checked, { shouldDirty: true });
                clearError("performer.ownEquipment");
              }}
            />
          </div>
        </div>
      ) : null}

      {category === "crew" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Crew role" htmlFor="crew-role" required error={errors["crew.role"]}>
            <Select
              id="crew-role"
              invalid={Boolean(errors["crew.role"])}
              {...bind("crew.role")}
            >
              <option value="">Select a role</option>
              {CREW_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Skill level"
            htmlFor="skill-level"
            required
            error={errors["crew.skillLevel"]}
          >
            <Select
              id="skill-level"
              invalid={Boolean(errors["crew.skillLevel"])}
              {...bind("crew.skillLevel")}
            >
              <option value="">Select a level</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Headcount"
            htmlFor="headcount"
            required
            error={errors["crew.headcount"]}
          >
            <Input
              id="headcount"
              type="number"
              min={1}
              max={500}
              step={1}
              inputMode="numeric"
              placeholder="2"
              invalid={Boolean(errors["crew.headcount"])}
              {...bind("crew.headcount", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Shift length (hours)"
            htmlFor="shift-hours"
            required
            error={errors["crew.shiftHours"]}
          >
            <Input
              id="shift-hours"
              type="number"
              min={1}
              max={24}
              step={0.5}
              inputMode="decimal"
              placeholder="8"
              invalid={Boolean(errors["crew.shiftHours"])}
              {...bind("crew.shiftHours", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label="Daily rate per person (INR)"
            htmlFor="daily-rate"
            required
            className="sm:col-span-2"
            error={errors["crew.dailyRate"]}
          >
            <Input
              id="daily-rate"
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
              placeholder="8000"
              invalid={Boolean(errors["crew.dailyRate"])}
              {...bind("crew.dailyRate", { valueAsNumber: true })}
            />
          </Field>

          <div className="sm:col-span-2">
            <Toggle
              label="Crew brings their own gear"
              description="Cameras, lenses, audio or lighting kit."
              checked={form.watch("crew.ownGear") ?? false}
              onChange={(checked) => {
                form.setValue("crew.ownGear", checked, { shouldDirty: true });
                clearError("crew.ownGear");
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
