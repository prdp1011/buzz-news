"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOPIC_ICONS: Record<string, string> = {
  "nursery-rhymes": "🎵",
  general: "🎯",
  science: "🔬",
  history: "📜",
};

export function LeftSidebar({
  topics,
}: {
  topics: { slug: string; label: string }[];
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "🏠", label: "Home" },
    ...topics.map((t) => ({
      href: `/topic/${t.slug}`,
      icon: TOPIC_ICONS[t.slug] ?? "📂",
      label: t.label,
    })),
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
      <div className="flex flex-col items-center gap-6 px-3 py-6">
        <Link
          href="/"
          className="flex items-center justify-center rounded-lg p-2 transition hover:bg-zinc-800"
          title="QuizLab"
        >
          <span className="text-2xl">🧠</span>
        </Link>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition ${
                isActive
                  ? "text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
