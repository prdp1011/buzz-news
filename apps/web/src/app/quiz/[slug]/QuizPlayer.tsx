"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GradeResult, QuizMeta } from "@/lib/quiz";

type CheckResult = {
  wasRight: boolean;
  correctOptionId: string;
  explanation: string | null;
};

type QuestionPayload = {
  index: number;
  displayNumber: number;
  total: number;
  title: string;
  description: string | null;
  emoji: string | null;
  question: { id: string; text: string; options: { id: string; text: string }[] };
};

function answersKey(slug: string) {
  return `${slug}:answers`;
}

function readAnswers(slug: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(answersKey(slug));
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object" || Array.isArray(p)) return {};
    return p as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAnswers(slug: string, answers: Record<string, string>) {
  localStorage.setItem(answersKey(slug), JSON.stringify(answers));
}

/** 0-based question index */
function persistQuestionProgress(slug: string, questionIndex: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(slug, String(questionIndex));
}

function clearJourney(slug: string) {
  localStorage.removeItem(slug);
  localStorage.removeItem(answersKey(slug));
}

export function QuizPlayer({
  slug,
  questionIndex,
  meta,
}: {
  slug: string;
  questionIndex: number;
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
  const [reveal, setReveal] = useState<CheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lastIndex = Math.max(0, meta.totalQuestions - 1);

  useEffect(() => {
    setAnswers(readAnswers(slug));
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    setReveal(null);
    setCheckError(null);
    setError(null);
  }, [questionIndex]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setPayload(null);
    (async () => {
      const res = await fetch(
        `/api/quiz/${encodeURIComponent(slug)}/question/${questionIndex}`,
      );
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(
          res.status === 404 ? "Question not found." : "Could not load question.",
        );
        return;
      }
      const data = (await res.json()) as QuestionPayload;
      setPayload(data);
      persistQuestionProgress(slug, questionIndex);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, questionIndex]);

  useEffect(() => {
    if (!payload || !hydrated) return;
    const saved = readAnswers(slug)[payload.question.id];
    if (!saved) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(
        `/api/quiz/${encodeURIComponent(slug)}/question/${questionIndex}/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId: saved }),
        },
      );
      const data = (await res.json()) as CheckResult | { error?: string };
      if (cancelled) return;
      if (!res.ok || ("error" in data && data.error)) {
        setCheckError("Could not restore answer state.");
        return;
      }
      setReveal(data as CheckResult);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, questionIndex, payload?.question.id, hydrated]);

  const persistPick = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: optionId };
        writeAnswers(slug, next);
        return next;
      });
    },
    [slug],
  );

  function pick(optionId: string) {
    if (!payload || phase !== "playing" || reveal !== null || pending) return;
    startTransition(async () => {
      setCheckError(null);
      const res = await fetch(
        `/api/quiz/${encodeURIComponent(slug)}/question/${questionIndex}/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId }),
        },
      );
      const data = (await res.json()) as CheckResult | { error?: string };
      if (!res.ok || ("error" in data && data.error)) {
        setCheckError("Could not check answer. Try again.");
        return;
      }
      persistPick(payload.question.id, optionId);
      setReveal(data as CheckResult);
    });
  }

  const selectedForCurrent =
    payload && hydrated ? answers[payload.question.id] : undefined;
  const correctId = reveal?.correctOptionId;

  function goPrev() {
    if (questionIndex <= 0 || pending) return;
    router.push(`/quiz/${slug}/${questionIndex - 1}`);
  }

  function goNext() {
    if (!payload || reveal === null || pending) return;
    if (questionIndex < lastIndex) {
      router.push(`/quiz/${slug}/${questionIndex + 1}`);
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
        setError(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Grading failed",
        );
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
                  d.wasRight
                    ? "border-emerald-800/60 bg-emerald-950/20"
                    : "border-red-900/50 bg-red-950/15"
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
  const displayNum = payload.displayNumber;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 shadow-lg shadow-black/20 md:p-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-rose-400 md:text-xs">
          {meta.title}
        </p>
        {meta.description && (
          <p className="mt-2 text-center text-sm text-zinc-500">{meta.description}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
          <span aria-hidden>💬</span>
          <span>
            Question {displayNum} of {total}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-bold leading-snug text-zinc-50 md:text-2xl">
          {current.text}
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {current.options.map((opt) => {
            const isPicked = selectedForCurrent === opt.id;
            const isCorrect = Boolean(reveal && correctId === opt.id);
            const isWrongPick = Boolean(reveal && isPicked && !reveal.wasRight);

            let boxClass =
              "relative rounded-2xl border-2 bg-zinc-950/50 px-4 py-4 text-left shadow-md transition ";
            let textClass = "text-zinc-300";

            if (reveal) {
              if (isCorrect) {
                boxClass +=
                  " border-emerald-500 bg-emerald-950/30 shadow-emerald-500/15 ring-1 ring-emerald-500/25";
                textClass = "font-semibold text-emerald-200";
              } else if (isWrongPick) {
                boxClass +=
                  " border-red-500 bg-red-950/25 shadow-red-500/15 ring-1 ring-red-500/25";
                textClass = "font-semibold text-red-200";
              } else {
                boxClass += " border-zinc-700/80 opacity-55";
                textClass = "text-zinc-500";
              }
            } else {
              boxClass += isPicked
                ? " border-amber-400/70 bg-amber-400/5"
                : " border-zinc-600 hover:border-zinc-500";
            }

            const showWrongBadge = isWrongPick;
            const showRightBadge = isCorrect && reveal;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={Boolean(reveal) || pending}
                onClick={() => pick(opt.id)}
                className={`${boxClass} disabled:cursor-default`}
              >
                {(showWrongBadge || showRightBadge) && (
                  <span
                    className={`absolute left-1/2 top-0 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-zinc-950 text-xs font-bold text-white ${
                      showRightBadge ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    aria-hidden
                  >
                    {showRightBadge ? "✓" : "✕"}
                  </span>
                )}
                <span className={`block text-sm leading-snug md:text-base ${textClass}`}>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {reveal && (
          <div
            className={`mt-6 rounded-2xl border-2 p-4 md:p-5 ${
              reveal.wasRight
                ? "border-emerald-800/60 bg-emerald-950/25"
                : "border-red-800/60 bg-red-950/25"
            }`}
          >
            <p
              className={`text-base font-bold ${
                reveal.wasRight ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {reveal.wasRight ? "Correct! 🎉" : "Wrong answer 😔"}
            </p>
            {reveal.explanation ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{reveal.explanation}</p>
            ) : !reveal.wasRight ? (
              <p className="mt-2 text-sm text-zinc-500">
                The correct choice is highlighted in green above.
              </p>
            ) : null}
          </div>
        )}

        {(checkError || error) && (
          <p className="mt-4 text-sm text-red-400">{checkError ?? error}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            disabled={questionIndex <= 0 || pending}
            onClick={goPrev}
            className="rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={reveal === null || pending}
            onClick={goNext}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 py-4 text-base font-bold text-white shadow-lg shadow-rose-900/30 transition hover:bg-rose-500 disabled:opacity-35 disabled:shadow-none sm:w-auto sm:min-w-[220px] sm:flex-1"
          >
            {pending && questionIndex >= lastIndex ? (
              "Loading results…"
            ) : questionIndex >= lastIndex ? (
              <>
                See results <span aria-hidden>&gt;&gt;</span>
              </>
            ) : (
              <>
                Next question <span aria-hidden>&gt;&gt;</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
