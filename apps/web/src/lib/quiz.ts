import { fetchQuizApi } from "@/lib/internal-api";

export type SectionNavItem = {
  slug: string;
  label: string;
  emoji?: string;
  description?: string;
  coverImageUrl?: string | null;
};

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

export type QuizSectionsPageResult = {
  items: SectionNavItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getQuizSectionsPaginated(opts: {
  page: number;
  pageSize: number;
}): Promise<QuizSectionsPageResult> {
  const q = new URLSearchParams({
    page: String(opts.page),
    pageSize: String(opts.pageSize),
  });
  const res = await fetchQuizApi(`/api/quiz/sections?${q}`);
  if (!res.ok) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: opts.pageSize,
      totalPages: 1,
    };
  }
  return res.json() as Promise<QuizSectionsPageResult>;
}

/** @deprecated */
export async function getQuizTopics(): Promise<SectionNavItem[]> {
  return getQuizSections();
}

export type QuizTopicNav = SectionNavItem;

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
