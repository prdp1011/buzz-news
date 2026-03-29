import { fetchQuizApi } from "@/lib/internal-api";

export type SectionNavItem = { slug: string; label: string };

export type QuizListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  sectionSlug: string;
  sectionLabel: string;
  questionCount: number;
};

/** Quiz play metadata (questions loaded per URL via API). */
export type QuizMeta = {
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  totalQuestions: number;
};

export type GradeResult = {
  correct: number;
  total: number;
  details: {
    questionId: string;
    questionText: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    pickedOptionId: string | null;
    wasRight: boolean;
    explanation: string | null;
  }[];
};

export async function getQuizSections(): Promise<SectionNavItem[]> {
  const res = await fetchQuizApi("/api/quiz/sections");
  if (!res.ok) return [];
  return res.json() as Promise<SectionNavItem[]>;
}

/** @deprecated */
export async function getQuizTopics(): Promise<SectionNavItem[]> {
  return getQuizSections();
}

export type QuizTopicNav = SectionNavItem;

export type ListQuizzesPaginatedResult = {
  items: QuizListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listQuizzesPaginated(opts: {
  page: number;
  pageSize: number;
}): Promise<ListQuizzesPaginatedResult> {
  const q = new URLSearchParams({
    page: String(opts.page),
    pageSize: String(opts.pageSize),
  });
  const res = await fetchQuizApi(`/api/quiz/list?${q}`);
  if (!res.ok) {
    return {
      items: [],
      total: 0,
      page: opts.page,
      pageSize: opts.pageSize,
      totalPages: 1,
    };
  }
  return res.json() as Promise<ListQuizzesPaginatedResult>;
}

export async function listQuizzes(sectionSlug?: string): Promise<QuizListItem[]> {
  const q = new URLSearchParams({ page: "1", pageSize: "200" });
  if (sectionSlug) q.set("section", sectionSlug);
  const res = await fetchQuizApi(`/api/quiz/list?${q}`);
  if (!res.ok) return [];
  const data = (await res.json()) as ListQuizzesPaginatedResult;
  return data.items;
}

export type SectionRecord = {
  id: string;
  slug: string;
  label: string;
  coverImageUrl: string | null;
};

export async function loadSectionPage(slug: string): Promise<{
  section: SectionRecord;
  quizzes: QuizListItem[];
} | null> {
  const res = await fetchQuizApi(`/api/quiz/section/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<{ section: SectionRecord; quizzes: QuizListItem[] }>;
}

/** @deprecated Use loadSectionPage */
export async function getSectionBySlug(slug: string) {
  const data = await loadSectionPage(slug);
  return data?.section ?? null;
}

export async function getQuizMeta(slug: string): Promise<QuizMeta | null> {
  const res = await fetchQuizApi(`/api/quiz/${encodeURIComponent(slug)}/meta`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<QuizMeta>;
}

export type SidebarQuizLink = { slug: string; title: string; emoji: string | null };

export async function listSidebarQuizzes(): Promise<SidebarQuizLink[]> {
  const res = await fetchQuizApi("/api/quiz/sidebar");
  if (!res.ok) return [];
  return res.json() as Promise<SidebarQuizLink[]>;
}
