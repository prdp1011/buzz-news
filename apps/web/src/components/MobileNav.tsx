"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TOPIC_ICONS: Record<string, string> = {
  "nursery-rhymes": "🎵",
  general: "🎯",
  science: "🔬",
  history: "📜",
};

export function MobileNav({
  topics,
}: {
  topics: { slug: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navItems = [
    { href: "/", icon: "🏠", label: "Home" },
    ...topics.map((t) => ({
      href: `/topic/${t.slug}`,
      icon: TOPIC_ICONS[t.slug] ?? "📂",
      label: t.label,
    })),
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-base font-bold text-amber-400"
        >
          <span className="text-xl md:text-2xl">🧠</span>
          QuizLab
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Open menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-64 border-r border-zinc-800 bg-zinc-950 shadow-xl transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
            <span className="text-lg font-bold text-amber-400">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-0.5 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition min-h-[48px] ${
                    isActive
                      ? "bg-zinc-800 text-amber-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
