"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { API_URL, fetchRequirements, fetchStats } from "@/lib/api";
import { CATEGORIES, CATEGORY_META } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import type { Requirement, Stats } from "@/lib/types";
import { cn, formatCurrency, formatDateRange, formatNumber, relativeTime } from "@/lib/utils";
import { CategoryBadge, Spinner } from "@/components/ui";

type Filter = "all" | Category;

function summaryLine(requirement: Requirement): string {
  switch (requirement.category) {
    case "planner": {
      const planner = requirement.planner;
      if (!planner) return "Planner requirement";
      return `${formatNumber(planner.guestCount)} guests · ${formatCurrency(
        planner.budgetMin,
      )} – ${formatCurrency(planner.budgetMax)}`;
    }
    case "performer": {
      const performer = requirement.performer;
      if (!performer) return "Performer requirement";
      return `${performer.performerType} · ${performer.setDurationMinutes} min set · ${formatCurrency(
        performer.feeExpectation,
      )}`;
    }
    case "crew": {
      const crew = requirement.crew;
      if (!crew) return "Crew requirement";
      return `${crew.role} × ${crew.headcount} · ${formatCurrency(crew.dailyRate)}/day`;
    }
  }
}

export default function RequirementsPage() {
  const [items, setItems] = useState<Requirement[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [list, statsResult] = await Promise.all([
        fetchRequirements({
          category: filter === "all" ? undefined : filter,
          q: query || undefined,
        }),
        fetchStats(),
      ]);
      setItems(list.data);
      setTotal(list.meta.total);
      setStats(statsResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load requirements.");
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    setQuery(queryInput.trim());
  };

  const countFor = (value: Filter) =>
    value === "all" ? (stats?.total ?? 0) : (stats?.byCategory[value] ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Browse</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
            Requirements
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            Saved records, newest first.
          </p>
        </div>
        <Link href="/post-requirement" className="btn btn-primary">
          Post requirement
        </Link>
      </div>

      <div className="flex flex-col gap-3 border-b border-stone-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-5 overflow-x-auto">
          {(["all", ...CATEGORIES] as Filter[]).map((value) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={cn(
                  "-mb-px whitespace-nowrap border-b-2 pb-2.5 pt-1 text-[13px] transition-colors",
                  active
                    ? "border-stone-900 font-medium text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-900",
                )}
              >
                {value === "all" ? "All" : CATEGORY_META[value].short}
                <span className="ml-1.5 font-mono text-[10px] text-stone-400">
                  {countFor(value)}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSearch} className="flex gap-2 pb-2">
          <input
            type="search"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search event or city"
            aria-label="Search requirements"
            className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-[13px] text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 sm:w-56"
          />
          <button type="submit" className="btn btn-secondary py-1.5">
            Search
          </button>
        </form>
      </div>

      {error ? (
        <div className="rounded border border-rose-300 bg-white p-5">
          <p className="text-[13px] font-medium text-rose-900">Could not reach the API</p>
          <p className="mt-1 text-[13px] text-stone-600">{error}</p>
          <p className="mt-2 text-xs text-stone-500">
            Expected API at <span className="font-mono text-stone-700">{API_URL}</span>. Set{" "}
            <span className="font-mono text-stone-700">NEXT_PUBLIC_API_URL</span> if this is the
            wrong address.
          </p>
          <button type="button" onClick={() => void load()} className="btn btn-secondary mt-4">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 rounded border border-stone-200 bg-white px-4 py-6 text-[13px] text-stone-500">
          <Spinner className="text-stone-500" />
          Loading requirements…
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="rounded border border-stone-200 bg-white p-6">
          <p className="text-[13px] font-medium text-stone-900">
            {query
              ? `No requirements match “${query}”`
              : filter === "all"
                ? "No requirements yet"
                : `No ${CATEGORY_META[filter].label.toLowerCase()} requirements yet`}
          </p>
          <p className="mt-1 text-[13px] text-stone-500">
            {query
              ? "Try a different search term or clear the filter."
              : filter === "all"
                ? "Once a requirement is posted it will appear here."
                : "Post one, or switch to another category."}
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setQueryInput("");
              }}
              className="mt-3 text-[13px] text-stone-700 underline underline-offset-2 hover:text-stone-900"
            >
              Clear search
            </button>
          ) : (
            <Link href="/post-requirement" className="btn btn-primary mt-4">
              Post requirement
            </Link>
          )}
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <div className="overflow-hidden rounded border border-stone-200 bg-white">
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_160px_90px] gap-4 border-b border-stone-200 bg-stone-50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.09em] text-stone-500 sm:grid">
              <span>Event</span>
              <span>Category</span>
              <span>Dates</span>
              <span>Posted</span>
            </div>

            {items.map((requirement) => (
              <Link
                key={requirement.id}
                href={`/requirements/${requirement.id}`}
                className="grid grid-cols-1 gap-1 border-b border-stone-100 px-4 py-4 transition-colors last:border-0 hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400 sm:grid-cols-[minmax(0,1fr)_100px_160px_90px] sm:items-baseline sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-stone-900">
                    {requirement.basics.eventName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {requirement.basics.eventType} · {summaryLine(requirement)}
                  </p>
                  <p className="mt-1 text-xs text-stone-400 sm:hidden">
                    {CATEGORY_META[requirement.category].short} ·{" "}
                    {formatDateRange(requirement.basics.startDate, requirement.basics.endDate)} ·{" "}
                    {relativeTime(requirement.createdAt)}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <CategoryBadge category={requirement.category} />
                </div>
                <p className="hidden text-xs text-stone-600 sm:block">
                  {formatDateRange(requirement.basics.startDate, requirement.basics.endDate)}
                </p>
                <p className="hidden font-mono text-[10px] text-stone-400 sm:block">
                  {relativeTime(requirement.createdAt)}
                </p>
              </Link>
            ))}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.09em] text-stone-400">
            Showing {items.length} of {total}
            {filter !== "all" ? ` · ${CATEGORY_META[filter].label}` : ""}
            {query ? ` · “${query}”` : ""}
          </p>
        </>
      ) : null}
    </div>
  );
}
