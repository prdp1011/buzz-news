"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function resolveResumeIndex(raw: string | null, totalQuestions: number): number {
  if (raw == null || raw === "") return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  if (n >= 0 && n < totalQuestions) return n;
  if (n >= 1 && n <= totalQuestions) return n - 1;
  return Math.min(Math.max(0, n), Math.max(0, totalQuestions - 1));
}

/**
 * Resume: localStorage key = quiz slug, value = 0-based question index (string).
 * Legacy 1-based values (1..totalQuestions) are still accepted.
 */
export function QuizResumeRedirect({
  slug,
  totalQuestions,
}: {
  slug: string;
  totalQuestions: number;
}) {
  const router = useRouter();
  const ran = useRef(false);

  useLayoutEffect(() => {
    if (ran.current || totalQuestions < 1) return;
    ran.current = true;
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(slug) : null;
    const idx = resolveResumeIndex(stored, totalQuestions);
    router.replace(`/quiz/${encodeURIComponent(slug)}/${idx}`);
  }, [slug, totalQuestions, router]);

  return null;
}
