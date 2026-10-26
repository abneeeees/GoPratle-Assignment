import Link from "next/link";
import { CATEGORIES, CATEGORY_META } from "@/lib/constants";

const steps = [
  {
    title: "Event basics",
    body: "Name, type, dates and location.",
  },
  {
    title: "Category details",
    body: "The fields change with the category you pick.",
  },
  {
    title: "Logistics & contact",
    body: "Deadline, budget flexibility and who receives responses.",
  },
  {
    title: "Review & submit",
    body: "Check the record, then save it under the right category.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="eyebrow">Requirement posting</p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl">
            Post an event requirement in four steps.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600">
            Planner, performer or crew. The form adapts to what you are hiring for, then saves the
            record to MongoDB.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link href="/post-requirement" className="btn btn-primary">
              Start a requirement
            </Link>
            <Link href="/requirements" className="btn btn-secondary">
              Browse submissions
            </Link>
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.09em] text-stone-400">
            Drafts save in this browser
          </p>
        </div>

        <div className="lg:border-l lg:border-stone-200 lg:pl-10">
          <p className="eyebrow">Categories</p>
          <ul className="mt-3 border-y border-stone-200">
            {CATEGORIES.map((category, index) => {
              const meta = CATEGORY_META[category];
              return (
                <li key={category} className="flex gap-4 border-b border-stone-200 py-4 last:border-0">
                  <span className="w-5 shrink-0 pt-0.5 font-mono text-[11px] text-stone-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-stone-900">{meta.label}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-stone-500">
                      {meta.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section>
        <p className="eyebrow">How it works</p>
        <ol className="mt-3 border-t border-stone-200">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-stone-200 py-4 sm:grid-cols-[2.5rem_11rem_1fr]"
            >
              <span className="pt-0.5 font-mono text-[11px] text-stone-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="text-[13px] font-medium text-stone-900">{step.title}</h2>
              <p className="col-start-2 text-[13px] leading-relaxed text-stone-500 sm:col-start-3">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
