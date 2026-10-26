"use client";

import type { ReactNode } from "react";
import { CATEGORY_META } from "@/lib/constants";
import type { FormValues } from "@/lib/types";
import { formatCurrency, formatDateRange, formatNumber } from "@/lib/utils";
import { CategoryBadge, SectionHeading } from "@/components/ui";

interface ReviewProps {
  values: FormValues;
  onEdit: (step: number) => void;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-stone-100 py-2 last:border-0 sm:grid-cols-[170px_1fr] sm:gap-6">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="text-[13px] text-stone-900">{value || "—"}</dd>
    </div>
  );
}

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-stone-200 pt-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[13px] font-semibold text-stone-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="font-mono text-[10px] uppercase tracking-[0.09em] text-stone-500 underline-offset-2 hover:text-stone-900 hover:underline"
        >
          Edit
        </button>
      </div>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

const yesNo = (value: boolean | undefined | null) => (value ? "Yes" : "No");

export function StepReview({ values, onEdit }: ReviewProps) {
  const { basics, logistics, category } = values;
  const planner = values.planner;
  const performer = values.performer;
  const crew = values.crew;

  return (
    <div className="space-y-6">
      <SectionHeading
        step="Step 4 of 4"
        title="Review & submit"
        subtitle="Check the record before it is saved."
      />

      <Section title="Event basics" step={0} onEdit={onEdit}>
        <Row label="Event name" value={basics.eventName} />
        <Row label="Event type" value={basics.eventType} />
        <Row
          label="Dates"
          value={basics.startDate ? formatDateRange(basics.startDate, basics.endDate || null) : ""}
        />
        <Row
          label="Location"
          value={[basics.city, basics.state, basics.country].filter(Boolean).join(", ")}
        />
        <Row label="Venue" value={basics.venue || "Not decided yet"} />
        <Row
          label="Category"
          value={category ? <CategoryBadge category={category} /> : ""}
        />
      </Section>

      <Section
        title={category ? `${CATEGORY_META[category].label} details` : "Category details"}
        step={1}
        onEdit={onEdit}
      >
        {category === "planner" ? (
          <>
            <Row label="Guests" value={formatNumber(planner?.guestCount)} />
            <Row
              label="Budget"
              value={`${formatCurrency(planner?.budgetMin)} – ${formatCurrency(planner?.budgetMax)}`}
            />
            <Row label="Services" value={(planner?.services ?? []).join(", ")} />
            <Row label="Experience" value={planner?.experienceLevel} />
          </>
        ) : null}

        {category === "performer" ? (
          <>
            <Row label="Act" value={performer?.performerType} />
            <Row label="Genre / style" value={performer?.genre} />
            <Row
              label="Set length"
              value={performer?.setDurationMinutes ? `${performer.setDurationMinutes} minutes` : ""}
            />
            <Row label="Fee expectation" value={formatCurrency(performer?.feeExpectation)} />
            <Row label="Own equipment" value={yesNo(performer?.ownEquipment)} />
            <Row label="Portfolio" value={performer?.portfolioUrl ?? "Not provided"} />
          </>
        ) : null}

        {category === "crew" ? (
          <>
            <Row label="Role" value={crew?.role} />
            <Row label="Headcount" value={formatNumber(crew?.headcount)} />
            <Row
              label="Shift length"
              value={crew?.shiftHours ? `${crew.shiftHours} hours` : ""}
            />
            <Row label="Skill level" value={crew?.skillLevel} />
            <Row label="Daily rate" value={formatCurrency(crew?.dailyRate)} />
            <Row label="Own gear" value={yesNo(crew?.ownGear)} />
          </>
        ) : null}
      </Section>

      <Section title="Logistics & contact" step={2} onEdit={onEdit}>
        <Row
          label="Response deadline"
          value={logistics.responseDeadline ? formatDateRange(logistics.responseDeadline, null) : ""}
        />
        <Row label="Budget flexibility" value={logistics.budgetFlexibility} />
        <Row label="Travel covered" value={yesNo(logistics.travelCovered)} />
        {category === "planner" ? (
          <Row label="Engagement" value={logistics.plannerContractType} />
        ) : null}
        {category === "performer" ? (
          <Row label="Soundcheck required" value={yesNo(logistics.performerSoundcheck)} />
        ) : null}
        {category === "crew" ? (
          <Row label="Equipment provided" value={yesNo(logistics.crewEquipmentProvided)} />
        ) : null}
        <Row label="Contact" value={logistics.contactName} />
        <Row label="Email" value={logistics.contactEmail} />
        <Row label="Phone" value={logistics.contactPhone || "Not provided"} />
        <Row label="Notes" value={logistics.notes || "None"} />
      </Section>
    </div>
  );
}
