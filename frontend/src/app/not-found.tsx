import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md">
      <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-stone-400">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">
        Requirement not found
      </h1>
      <p className="mt-2 text-[13px] text-stone-600">
        It may have been removed, or the link is malformed.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/requirements" className="btn btn-secondary">
          Browse requirements
        </Link>
        <Link href="/post-requirement" className="btn btn-primary">
          Post one
        </Link>
      </div>
    </div>
  );
}
