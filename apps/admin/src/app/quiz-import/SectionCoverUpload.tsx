"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { updateSectionCoverImage } from "./actions";

type Section = { slug: string; label: string; coverImageUrl: string };

export function SectionCoverUpload({ sections }: { sections: Section[] }) {
  if (sections.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No sections in section.json yet. Import JSON or edit apps/web/data/section.json.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <SectionRow key={s.slug} section={s} />
      ))}
    </div>
  );
}

function SectionRow({ section }: { section: Section }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setStatus(null);
    setErr(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Upload failed");
        return;
      }
      if (!data.url) {
        setErr("No URL returned");
        return;
      }
      startTransition(async () => {
        const r = await updateSectionCoverImage(section.slug, data.url!);
        if (r.ok) {
          setStatus("Cover image saved.");
          router.refresh();
        } else setErr(r.error);
      });
    } catch {
      setErr("Upload request failed");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-200">{section.label}</p>
        <p className="text-xs text-zinc-500">
          slug: <code className="text-zinc-400">{section.slug}</code>
        </p>
        {section.coverImageUrl?.trim() ? (
          <p className="mt-1 truncate text-xs text-zinc-600" title={section.coverImageUrl}>
            {section.coverImageUrl}
          </p>
        ) : (
          <p className="mt-1 text-xs text-zinc-600">No cover image</p>
        )}
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <label className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700">
          {pending ? "Saving…" : "Upload cover image"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} disabled={pending} />
        </label>
        <p className="text-xs text-zinc-600">
          Uses Cloudinary if configured in <code className="text-zinc-500">.env</code>.
        </p>
        {status && <p className="text-xs text-emerald-400">{status}</p>}
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>
    </div>
  );
}
