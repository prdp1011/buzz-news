"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Source {
  id: string;
  name: string;
  type: string;
  feedUrl: string;
  isActive: boolean;
}

interface FetchFreshStoriesButtonProps {
  sources: Source[];
}

export function FetchFreshStoriesButton({ sources }: FetchFreshStoriesButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const rssSources = sources.filter((s) => s.type === "RSS" && s.isActive);

  async function handleFetch() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceIds: selectedIds.length > 0 ? selectedIds : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Fetch failed" });
        return;
      }

      const parts = [];
      if (data.created > 0) parts.push(`${data.created} new`);
      if (data.deduplicated > 0) parts.push(`${data.deduplicated} duplicates skipped`);
      if (data.processed > 0) parts.push(`${data.processed} processed`);
      if (data.errors?.length > 0) {
        parts.push(`Errors: ${data.errors.join("; ")}`);
      }
      setMessage({
        type: data.errors?.length ? "error" : "success",
        text: parts.join(" • ") || "Done",
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  function toggleSource(id: string) {
    setSelectedIds((prev) => {
      const isAll = prev.length === 0;
      const ids = isAll ? rssSources.map((s) => s.id) : prev;
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      return next.length === rssSources.length ? [] : next; // all selected = use []
    });
  }

  function selectAll() {
    setSelectedIds([]); // empty = fetch from all
  }

  if (rssSources.length === 0) {
    return (
      <span className="text-sm text-zinc-500" title="No RSS sources configured">
        No feeds
      </span>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            Fetch from {selectedIds.length === 0 ? "all" : `${selectedIds.length} selected`} ▼
          </button>
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
                aria-hidden
              />
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-lg border border-zinc-700 bg-zinc-900 py-2 shadow-xl">
                <div className="mb-2 border-b border-zinc-700 px-3 pb-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    All feeds
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {rssSources.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === 0 || selectedIds.includes(s.id)
                        }
                        onChange={() => toggleSource(s.id)}
                        className="rounded border-zinc-600"
                      />
                      <span className="truncate text-sm text-zinc-300">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Fetching…" : "Get Fresh Stories"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-sm ${message.type === "success" ? "text-emerald-400" : "text-amber-400"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
