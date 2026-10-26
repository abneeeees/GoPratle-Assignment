import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GoPratle — Event requirements",
    template: "%s | GoPratle",
  },
  description: "Post and browse event requirements for planners, performers and crew.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
            <Link href="/" className="flex items-baseline gap-2.5">
              <span className="text-[15px] font-semibold tracking-tight text-stone-900">
                GoPratle
              </span>
              <span className="hidden text-[13px] text-stone-400 sm:inline">Requirements</span>
            </Link>

            <nav className="flex items-center gap-1 text-[13px]">
              <Link
                href="/requirements"
                className="rounded px-2.5 py-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                Browse
              </Link>
              <Link href="/post-requirement" className="btn btn-primary ml-1">
                Post requirement
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
          {children}
        </main>

        <footer className="border-t border-stone-200">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 font-mono text-[10px] uppercase tracking-[0.09em] text-stone-400 sm:px-6">
            <span>GoPratle</span>
            <span>&copy; 2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
