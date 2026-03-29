"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const QUIZ_NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/quiz-import", label: "JSON import" },
  { href: "/quiz-sections", label: "Sections" },
  { href: "/quiz-items", label: "Quizzes" },
  { href: "/quiz-questions", label: "Questions" },
] as const;

const LEGACY_NAV = [
  { href: "/posts", label: "Posts" },
  { href: "/posts/new", label: "New post" },
  { href: "/drafts", label: "Drafts" },
  { href: "/social-posts", label: "Social posts" },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Quiz admin</p>
        <p className="mt-1 text-sm text-zinc-400">Sections & quizzes — no catalog.</p>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        <p className="mb-1 px-3 text-xs font-bold uppercase text-zinc-600">Quiz</p>
        {QUIZ_NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-zinc-800 text-cyan-400"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <p className="mb-1 mt-4 px-3 text-xs font-bold uppercase text-zinc-600">Legacy content</p>
        {LEGACY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-800 p-3">
        <LogoutButton />
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          Public site →
        </a>
      </div>
    </div>
  );
}
