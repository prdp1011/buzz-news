"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { gradeQuiz, type GradeResult } from "./actions";
import type { QuizPlayPayload } from "@/lib/quiz";

type Phase = "playing" | "results";

export function QuizPlayer({ quiz }: { quiz: QuizPlayPayload }) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("playing");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = quiz.questions[index];
  const total = quiz.questions.length;
  const isLast = index === total - 1;

  const selectedForCurrent = current ? selections[current.id] : undefined;

  const questionById = useMemo(() => {
    const m = new Map(quiz.questions.map((q) => [q.id, q]));
    return m;
  }, [quiz.questions]);

  function pick(optionId: string) {
    if (!current || phase !== "playing") return;
    setSelections((s) => ({ ...s, [current.id]: optionId }));
  }

  function goNext() {
    if (!current || !selectedForCurrent) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    startTransition(async () => {
      setError(null);
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        optionId: selections[q.id] ?? null,
      }));
      const res = await gradeQuiz(quiz.slug, payload);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(res);
      setPhase("results");
    });
  }

  if (phase === "results" && result) {
    const pct = Math.round((result.correct / result.total) * 100);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-6 text-center">
          <p className="text-sm font-medium text-zinc-400">Your score</p>
          <p className="mt-2 text-4xl font-bold text-amber-400">
            {result.correct}/{result.total}
          </p>
          <p className="mt-1 text-zinc-500">{pct}% correct</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-300"
          >
            More quizzes
          </Link>
        </div>
        <ul className="space-y-4">
          {result.details.map((d) => {
            const q = questionById.get(d.questionId);
            if (!q) return null;
            const opts = new Map(q.options.map((o) => [o.id, o.text]));
            return (
              <li
                key={d.questionId}
                className={`rounded-xl border p-4 ${
                  d.wasRight ? "border-emerald-800/60 bg-emerald-950/20" : "border-red-900/50 bg-red-950/15"
                }`}
              >
                <p className="font-medium text-zinc-200">{q.text}</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Your answer:{" "}
                  <span className={d.wasRight ? "text-emerald-400" : "text-red-300"}>
                    {d.pickedOptionId ? (opts.get(d.pickedOptionId) ?? "—") : "Skipped"}
                  </span>
                </p>
                {!d.wasRight && (
                  <p className="mt-1 text-sm text-emerald-400/90">
                    Correct: {opts.get(d.correctOptionId) ?? "—"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Question {index + 1} of {total}
        </span>
        <div className="h-1.5 flex-1 max-w-[120px] rounded-full bg-zinc-800 mx-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="text-xl font-bold text-zinc-100 leading-snug">{current.text}</h2>
      <div className="grid gap-2">
        {current.options.map((opt) => {
          const active = selectedForCurrent === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                active
                  ? "border-amber-400 bg-amber-400/10 text-amber-200"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        disabled={!selectedForCurrent || pending}
        onClick={goNext}
        className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-zinc-950 disabled:opacity-40 hover:bg-amber-300"
      >
        {pending ? "Checking…" : isLast ? "See results" : "Next"}
      </button>
    </div>
  );
}
