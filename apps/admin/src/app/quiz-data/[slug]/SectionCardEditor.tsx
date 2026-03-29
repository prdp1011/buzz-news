"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SectionIndexRow } from "@/lib/quiz-file-store";
import { updateSectionCardAction } from "../actions";

export function SectionCardEditor({ slug, section }: { slug: string; section: SectionIndexRow }) {
  const router = useRouter();
  const [label, setLabel] = useState(section.label);
  const [description, setDescription] = useState(section.description);
  const [emoji, setEmoji] = useState(section.emoji);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const r = await updateSectionCardAction(slug, { label, description, emoji });
      if (r.ok) {
        setMsg("Section card saved.");
        router.refresh();
      } else setErr(r.error);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-zinc-200">Section card (section.json)</h2>
      <p className="text-sm text-zinc-500">
        Used on the public site for the section tile. Quiz title/description below live in the quiz JSON file.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-zinc-400">Label</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-400">Emoji</span>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-zinc-400">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save section card"}
        </button>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
        {err && <span className="text-sm text-red-400">{err}</span>}
      </div>
    </form>
  );
}
