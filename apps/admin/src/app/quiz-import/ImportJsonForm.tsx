"use client";

import { useState, useTransition } from "react";
import { importQuizJson } from "./actions";
import { SAMPLE_QUIZ_IMPORT_JSON } from "./sample-json";

export function ImportJsonForm() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function copySample() {
    void navigator.clipboard.writeText(SAMPLE_QUIZ_IMPORT_JSON);
    setMessage("Sample JSON copied to clipboard.");
    setError(null);
  }

  function submit() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await importQuizJson(text);
      if (res.ok) {
        setMessage(res.summary);
        setText("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-200">Sample JSON structure</h2>
          <button
            type="button"
            onClick={copySample}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
          >
            Copy sample to clipboard
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Root object has a <code className="text-cyan-400">sections</code> array. Each section can
          include <code className="text-cyan-400">coverImageUrl</code> (HTTPS image URL). New{" "}
          <code className="text-cyan-400">slug</code> values create sections automatically. Each quiz
          must have exactly four options per question; exactly one must have{" "}
          <code className="text-cyan-400">&quot;isCorrect&quot;: true</code>. Re-importing the same
          quiz <code className="text-cyan-400">slug</code> updates it and replaces all its
          questions.
        </p>
        <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-400">
          {SAMPLE_QUIZ_IMPORT_JSON}
        </pre>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-zinc-200">Paste JSON and import</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          placeholder='{ "sections": [ ... ] }'
          className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200"
          spellCheck={false}
        />
        {error && (
          <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-3 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        )}
        <button
          type="button"
          disabled={pending || !text.trim()}
          onClick={submit}
          className="mt-4 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40"
        >
          {pending ? "Importing…" : "Import JSON"}
        </button>
      </div>
    </div>
  );
}
