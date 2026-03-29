"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QuizFileData, QuizQuestionRow } from "@/lib/quiz-file-store";
import { saveQuizJsonAction } from "../actions";

function emptyQuestion(i: number): QuizQuestionRow {
  return {
    order: i,
    text: "",
    description: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
}

export function QuizEditorClient({ initialQuiz, slug }: { initialQuiz: QuizFileData; slug: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizFileData>(() => JSON.parse(JSON.stringify(initialQuiz)) as QuizFileData);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState("");
  const [aiPending, setAiPending] = useState(false);
  const [pending, startTransition] = useTransition();

  function setCorrect(qIndex: number, optIndex: number) {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) => {
        if (qi !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === optIndex })),
        };
      }),
    }));
  }

  function updateQuestionField(qi: number, field: "text" | "description", value: string) {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === qi ? { ...q, [field]: value } : q)),
    }));
  }

  function updateOptionText(qi: number, oi: number, value: string) {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qi) return q;
        return {
          ...q,
          options: q.options.map((o, j) => (j === oi ? { ...o, text: value } : o)),
        };
      }),
    }));
  }

  function addQuestion() {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion(prev.questions.length)],
    }));
  }

  function removeQuestion(i: number) {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== i),
    }));
  }

  async function aiAdd() {
    setErr(null);
    setMsg(null);
    setAiPending(true);
    try {
      const res = await fetch("/api/quiz-data/ai-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, hint: aiHint }),
      });
      const data = (await res.json()) as { error?: string; question?: QuizQuestionRow };
      if (!res.ok) {
        setErr(data.error ?? "AI request failed");
        return;
      }
      if (!data.question || !Array.isArray(data.question.options)) {
        setErr("Invalid AI response");
        return;
      }
      const q = data.question;
      setQuiz((prev) => ({
        ...prev,
        questions: [
          ...prev.questions,
          {
            order: prev.questions.length,
            text: q.text,
            description: typeof q.description === "string" ? q.description : "",
            options: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect === true,
            })),
          },
        ],
      }));
      setMsg("Added AI question — click Save quiz to write the file.");
    } catch {
      setErr("Network error");
    } finally {
      setAiPending(false);
    }
  }

  function save() {
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const payload: QuizFileData = {
        ...quiz,
        slug,
      };
      const r = await saveQuizJsonAction(slug, payload);
      if (r.ok) {
        setMsg("Saved.");
        router.refresh();
      } else setErr(r.error);
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200">Quiz metadata (section-wise-question/{slug}.json)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-zinc-400">Title</span>
            <input
              value={quiz.title}
              onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-zinc-400">Description</span>
            <textarea
              value={quiz.description}
              onChange={(e) => setQuiz((q) => ({ ...q, description: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">Emoji</span>
            <input
              value={quiz.emoji}
              onChange={(e) => setQuiz((q) => ({ ...q, emoji: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm pt-6">
            <input
              type="checkbox"
              checked={quiz.published}
              onChange={(e) => setQuiz((q) => ({ ...q, published: e.target.checked }))}
              className="rounded border-zinc-600"
            />
            <span className="text-zinc-300">Published</span>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-cyan-200">AI: add one question</h2>
        <p className="text-sm text-zinc-500">
          Optional hint (topic, difficulty, fact to test). Uses <code className="text-zinc-400">OPENAI_API_KEY</code> on
          the server.
        </p>
        <textarea
          value={aiHint}
          onChange={(e) => setAiHint(e.target.value)}
          placeholder="e.g. Ask about espresso ratios for this coffee quiz"
          rows={2}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <button
          type="button"
          disabled={aiPending}
          onClick={() => void aiAdd()}
          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {aiPending ? "Generating…" : "AI add question"}
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-200">Questions ({quiz.questions.length})</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            Add empty question
          </button>
        </div>

        {quiz.questions.length === 0 && (
          <p className="text-sm text-zinc-500">No questions yet. Add manually or use AI.</p>
        )}

        <div className="space-y-6">
          {quiz.questions.map((q, qi) => (
            <div
              key={qi}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-400">Question {qi + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
              <label className="block text-sm">
                <span className="text-zinc-500">Prompt</span>
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestionField(qi, "text", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-500">Explanation (description)</span>
                <textarea
                  value={q.description}
                  onChange={(e) => updateQuestionField(qi, "description", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                />
              </label>
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Options — select the correct answer</p>
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={o.isCorrect}
                      onChange={() => setCorrect(qi, oi)}
                      className="mt-2.5"
                    />
                    <input
                      value={o.text}
                      onChange={(e) => updateOptionText(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-6">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save quiz"}
        </button>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
        {err && <span className="text-sm text-red-400">{err}</span>}
      </div>
    </div>
  );
}
