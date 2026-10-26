import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiClientError, API_URL, fetchRequirement } from "@/lib/api";
import { CATEGORY_META } from "@/lib/constants";
import type { Requirement } from "@/lib/types";
import { formatCurrency, formatDate, formatDateRange, formatNumber, relativeTime } from "@/lib/utils";
import { CategoryBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Requirement details",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-b border-stone-100 py-2 last:border-0 sm:grid-cols-[150px_1fr] sm:gap-6">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="text-[13px] text-stone-900">{value || "—"}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.09em] text-stone-500">{title}</h2>
      <dl className="mt-2 border-t border-stone-200">{children}</dl>
    </section>
  );
}

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let requirement: Requirement;

  try {
    requirement = await fetchRequirement(id);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }

    return (
      <div className="max-w-lg">
        <p className="eyebrow">Error</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">
          Could not load this requirement
        </h1>
        <p className="mt-2 text-[13px] text-stone-600">
          The API at <span className="font-mono text-stone-800">{API_URL}</span> did not respond as
          expected.
        </p>
        <Link href="/requirements" className="btn btn-secondary mt-5">
          Back to list
        </Link>
      </div>
    );
  }

  const meta = CATEGORY_META[requirement.category];
  const { basics, logistics } = requirement;

  return (
    <div className="space-y-8">
      <nav className="text-[13px]">
        <Link href="/requirements" className="text-stone-500 hover:text-stone-900">
          ← Requirements
        </Link>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={requirement.category} />
          <span className="text-stone-300" aria-hidden>
            /
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.09em] text-stone-400">
            Submitted {relativeTime(requirement.createdAt)}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-[28px]">
          {basics.eventName}
        </h1>
        <p className="mt-1 text-[13px] text-stone-500">
          {basics.eventType} · {formatDateRange(basics.startDate, basics.endDate)} ·{" "}
          {[basics.city, basics.state, basics.country].filter(Boolean).join(", ")}
        </p>
      </header>

      <div className="grid gap-x-12 gap-y-8 border-t border-stone-300 pt-8 lg:grid-cols-2">
        <Panel title="Event basics">
          <Row label="Event name" value={basics.eventName} />
          <Row label="Event type" value={basics.eventType} />
          <Row label="Dates" value={formatDateRange(basics.startDate, basics.endDate)} />
          <Row
            label="Location"
            value={[basics.city, basics.state, basics.country].filter(Boolean).join(", ")}
          />
          <Row label="Venue" value={basics.venue || "Not decided yet"} />
          <Row label="Category" value={meta.label} />
        </Panel>

        <Panel title={`${meta.label} details`}>
          {requirement.category === "planner" && requirement.planner ? (
            <>
              <Row label="Guests" value={formatNumber(requirement.planner.guestCount)} />
              <Row
                label="Budget"
                value={`${formatCurrency(requirement.planner.budgetMin)} – ${formatCurrency(
                  requirement.planner.budgetMax,
                )}`}
              />
              <Row label="Services" value={requirement.planner.services.join(", ")} />
              <Row label="Experience" value={requirement.planner.experienceLevel} />
            </>
          ) : null}

          {requirement.category === "performer" && requirement.performer ? (
            <>
              <Row label="Act" value={requirement.performer.performerType} />
              <Row label="Genre" value={requirement.performer.genre} />
              <Row label="Set length" value={`${requirement.performer.setDurationMinutes} minutes`} />
              <Row label="Fee expectation" value={formatCurrency(requirement.performer.feeExpectation)} />
              <Row label="Own equipment" value={requirement.performer.ownEquipment ? "Yes" : "No"} />
              <Row label="Portfolio" value={requirement.performer.portfolioUrl ?? "Not provided"} />
            </>
          ) : null}

          {requirement.category === "crew" && requirement.crew ? (
            <>
              <Row label="Role" value={requirement.crew.role} />
              <Row label="Headcount" value={formatNumber(requirement.crew.headcount)} />
              <Row label="Shift length" value={`${requirement.crew.shiftHours} hours`} />
              <Row label="Skill level" value={requirement.crew.skillLevel} />
              <Row label="Daily rate" value={formatCurrency(requirement.crew.dailyRate)} />
              <Row label="Own gear" value={requirement.crew.ownGear ? "Yes" : "No"} />
            </>
          ) : null}
        </Panel>

        <Panel title="Logistics & contact">
          <Row label="Response deadline" value={formatDate(logistics.responseDeadline)} />
          <Row label="Budget flexibility" value={logistics.budgetFlexibility} />
          <Row label="Travel covered" value={logistics.travelCovered ? "Yes" : "No"} />
          {requirement.category === "planner" ? (
            <Row label="Engagement" value={logistics.plannerContractType ?? "—"} />
          ) : null}
          {requirement.category === "performer" ? (
            <Row
              label="Soundcheck required"
              value={logistics.performerSoundcheck ? "Yes" : "No"}
            />
          ) : null}
          {requirement.category === "crew" ? (
            <Row
              label="Equipment provided"
              value={logistics.crewEquipmentProvided ? "Yes" : "No"}
            />
          ) : null}
          <Row label="Contact" value={logistics.contactName} />
          <Row label="Email" value={logistics.contactEmail} />
          <Row label="Phone" value={logistics.contactPhone ?? "Not provided"} />
        </Panel>

        <Panel title="Notes & record">
          <Row label="Notes" value={logistics.notes ?? "None"} />
          <Row label="Requirement ID" value={requirement.id} />
          <Row label="Created" value={formatDate(requirement.createdAt)} />
          <Row label="Updated" value={formatDate(requirement.updatedAt)} />
        </Panel>
      </div>
    </div>
  );
}
