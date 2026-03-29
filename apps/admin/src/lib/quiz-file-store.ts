import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

export type QuizOption = { text: string; isCorrect: boolean };
export type QuizQuestionRow = {
  order: number;
  text: string;
  description: string;
  options: QuizOption[];
};
export type QuizFileData = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  published: boolean;
  questions: QuizQuestionRow[];
};

export type SectionIndexRow = {
  slug: string;
  label: string;
  emoji: string;
  coverImageUrl: string;
  description: string;
};

export type SectionIndexFile = { sections: SectionIndexRow[] };

let cachedDataDir: string | null = null;

export function getWebDataDir(): string {
  if (cachedDataDir) return cachedDataDir;
  const a = path.resolve(process.cwd(), "..", "web", "data");
  const b = path.resolve(process.cwd(), "apps", "web", "data");
  if (fsSync.existsSync(path.join(a, "section.json"))) cachedDataDir = a;
  else if (fsSync.existsSync(path.join(b, "section.json"))) cachedDataDir = b;
  else cachedDataDir = a;
  return cachedDataDir;
}

export function sectionJsonPath(): string {
  return path.join(getWebDataDir(), "section.json");
}

export function quizJsonPath(slug: string): string {
  return path.join(getWebDataDir(), "section-wise-question", `${slug}.json`);
}

export async function readSectionIndex(): Promise<SectionIndexFile> {
  const raw = await fs.readFile(sectionJsonPath(), "utf-8");
  const p = JSON.parse(raw) as SectionIndexFile;
  if (!p.sections || !Array.isArray(p.sections)) throw new Error("Invalid section.json");
  return p;
}

export async function writeSectionIndex(data: SectionIndexFile): Promise<void> {
  const text = JSON.stringify(data, null, 2) + "\n";
  await fs.writeFile(sectionJsonPath(), text, "utf-8");
}

export async function readQuizFile(slug: string): Promise<QuizFileData | null> {
  try {
    const raw = await fs.readFile(quizJsonPath(slug), "utf-8");
    const p = JSON.parse(raw) as QuizFileData;
    if (typeof p.slug !== "string" || !Array.isArray(p.questions)) return null;
    return p;
  } catch {
    return null;
  }
}

export async function writeQuizFile(data: QuizFileData): Promise<void> {
  const text = JSON.stringify(data, null, 2) + "\n";
  await fs.mkdir(path.dirname(quizJsonPath(data.slug)), { recursive: true });
  await fs.writeFile(quizJsonPath(data.slug), text, "utf-8");
}

export type ListedQuiz = {
  slug: string;
  label: string;
  questionCount: number;
  mtimeMs: number;
  hasQuizFile: boolean;
  published: boolean | null;
};

export async function listQuizzesForAdmin(): Promise<ListedQuiz[]> {
  const idx = await readSectionIndex();
  const out: ListedQuiz[] = [];
  for (const s of idx.sections) {
    const p = quizJsonPath(s.slug);
    let mtimeMs = 0;
    let hasQuizFile = false;
    let questionCount = 0;
    let published: boolean | null = null;
    try {
      const st = await fs.stat(p);
      mtimeMs = st.mtimeMs;
      hasQuizFile = true;
      const q = await readQuizFile(s.slug);
      if (q) {
        questionCount = q.questions.length;
        published = q.published;
      }
    } catch {
      mtimeMs = 0;
    }
    out.push({
      slug: s.slug,
      label: s.label,
      questionCount,
      mtimeMs,
      hasQuizFile,
      published,
    });
  }
  out.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return out;
}

export async function getJsonQuizDashboardStats(): Promise<{
  sectionCount: number;
  quizFileCount: number;
  publishedQuizCount: number;
  questionCount: number;
}> {
  const listed = await listQuizzesForAdmin();
  let quizFileCount = 0;
  let publishedQuizCount = 0;
  let questionCount = 0;
  for (const row of listed) {
    if (row.hasQuizFile) quizFileCount++;
    if (row.published === true) publishedQuizCount++;
    questionCount += row.questionCount;
  }
  return {
    sectionCount: listed.length,
    quizFileCount,
    publishedQuizCount,
    questionCount,
  };
}
