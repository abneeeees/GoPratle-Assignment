import type { Metadata } from "next";
import { RequirementWizard } from "@/components/RequirementWizard";

export const metadata: Metadata = {
  title: "Post a requirement",
};

export default function PostRequirementPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="eyebrow">New requirement</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
          Post a requirement
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
          Four steps, about two minutes. Your progress is saved in this browser as you type.
        </p>
      </header>

      <RequirementWizard />
    </div>
  );
}
