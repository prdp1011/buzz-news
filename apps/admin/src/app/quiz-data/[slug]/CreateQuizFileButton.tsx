"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEmptyQuizAction } from "../actions";

export function CreateQuizFileButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400">
        This section exists in <code className="text-cyan-400">section.json</code> but there is no matching file in{" "}
        <code className="text-cyan-400">section-wise-question/{slug}.json</code> yet.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setErr(null);
          startTransition(async () => {
            const r = await createEmptyQuizAction(slug);
            if (r.ok) router.refresh();
            else setErr(r.error);
          });
        }}
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create empty quiz file"}
      </button>
      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}
