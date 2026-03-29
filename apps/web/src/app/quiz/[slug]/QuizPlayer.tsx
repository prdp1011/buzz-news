"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GradeResult, QuizMeta } from "@/lib/quiz";

type QuestionPayload = {
  index: number;
  total: number;
  title: string;
  description: string | null;
  emoji: string | null;
  question: { id: string; text: string; options: { id: string; text: string }[] };
};

const STORAGE_PREFIX = "quizlab:journey:v1:";

function readAnswers(slug: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return {};
    const p = JSON.parse(raw) as { answers?: unknown };
    if (!p.answers || typeof p.answers !== "object" || Array.isArray(p.answers)) return {};
    return p.answers as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAnswers(slug: string, answers: Record<string, string>) {
  localStorage.setItem(
    STORAGE_PREFIX + slug,
    JSON.stringify({
      v: 1,
      answers,
      updatedAt: new Date().toISOString(),
    }),
  );
}

function clearJourney(slug: string) {
  localStorage.removeItem(STORAGE_PREFIX + slug);
}

export function QuizPlayer({
  slug,
  questionNum,
  meta,
}: {
  slug: string;
  questionNum: number;
  meta: QuizMeta;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [payload, setPayload] = useState<QuestionPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"playing" | "results">("playing");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setAnswers(readAnswers(slug));
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setPayload(null);
    (async () => {
      const res = await fetch(`/api/quiz/${encodeURIComponent(slug)}/question/${questionNum}`);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.status === 404 ? "Question not found." : "Could not load question.");
        return;
      }
      const data = (await res.json()) as QuestionPayload;
      setPayload(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, questionNum]);

  const persistPick = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionId };
      writeAnswers(slug, next);
      return next;
    });
  }, [slug]);

  function pick(optionId: string) {
    if (!payload || phase !== "playing" || pending) return;
    persistPick(payload.question.id, optionId);
  }

  const selectedForCurrent =
    payload && hydrated ? answers[payload.question.id] : undefined;

  function goPrev() {
    if (questionNum <= 1 || pending) return;
    router.push(`/quiz/${slug}/${questionNum - 1}`);
  }

  function goNext() {
    if (!payload || !selectedForCurrent || pending) return;
    const isLast = questionNum >= meta.totalQuestions;
    if (!isLast) {
      router.push(`/quiz/${slug}/${questionNum + 1}`);
      return;
    }
    startTransition(async () => {
      setError(null);
      const toGrade = readAnswers(slug);
      const res = await fetch(`/api/quiz/${encodeURIComponent(slug)}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: toGrade }),
      });
      const data = (await res.json()) as GradeResult | { error?: string };
      if (!res.ok) {
        setError(typeof data === "object" && data && "error" in data ? String(data.error) : "Grading failed");
        return;
      }
      if ("error" in data && data.error) {
        setError(String(data.error));
        return;
      }
      clearJourney(slug);
      setAnswers({});
      setResult(data as GradeResult);
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
            const opts = new Map(d.options.map((o) => [o.id, o.text]));
            return (
              <li
                key={d.questionId}
                className={`rounded-xl border p-4 ${
                  d.wasRight ? "border-emerald-800/60 bg-emerald-950/20" : "border-red-900/50 bg-red-950/15"
                }`}
              >
                <p className="font-medium text-zinc-200">{d.questionText}</p>
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
                {d.explanation ? (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{d.explanation}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (loadError) {
    return <p className="text-sm text-red-400">{loadError}</p>;
  }

  if (!payload) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-500">
        Loading question…
      </div>
    );
  }

  const current = payload.question;
  const total = meta.totalQuestions;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 shadow-lg shadow-black/20 md:p-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-rose-400 md:text-xs">
          {meta.title}
        </p>
        {meta.description && (
          <p className="mt-2 text-center text-sm text-zinc-500">{meta.description}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span aria-hidden>💬</span>
          <span>
            Question {questionNum} of {total}
          </span>
          <span className="text-zinc-600">
            · {answeredCount} answered (saved for resume)
          </span>
        </div>

        <h2 className="mt-3 text-xl font-bold leading-snug text-zinc-50 md:text-2xl">
          {current.text}
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {current.options.map((opt, i) => {
            const isPicked = selectedForCurrent === opt.id;
            const boxClass =
              "relative rounded-2xl border-2 bg-zinc-950/50 px-4 py-4 text-left shadow-md transition " +
              (isPicked
                ? "border-amber-400/80 bg-amber-400/5"
                : "border-zinc-700 hover:border-zinc-500");
            const textClass = isPicked ? "font-medium text-zinc-200" : "text-zinc-300";

            return (
              <button
                key={opt.id}
                type="button"
                disabled={pending}
                onClick={() => pick(opt.id)}
                className={`${boxClass} disabled:opacity-50`}
              >
                <span className="mb-1 block text-xs font-medium text-zinc-500">{i + 1}</span>
                <span className={`block text-sm md:text-base ${textClass}`}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          Choices are saved in your browser. Use the URL to resume (bookmark or share this page).
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={questionNum <= 1 || pending}
            onClick={goPrev}
            className="rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={!selectedForCurrent || pending}
            onClick={goNext}
            className="w-full rounded-full bg-rose-600 py-4 text-base font-bold text-white shadow-lg shadow-rose-900/30 transition hover:bg-rose-500 disabled:opacity-35 disabled:shadow-none sm:w-auto sm:min-w-[200px] sm:flex-1"
          >
            {pending && questionNum >= total
              ? "Loading results…"
              : questionNum >= total
                ? "See results >>"
                : "Next question >>"}
          </button>
        </div>
      </div>
    </div>
  );
}
