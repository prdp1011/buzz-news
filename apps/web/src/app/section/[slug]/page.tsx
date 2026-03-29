import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { loadSectionPage } from "@/lib/quiz";
import { QuizCard } from "@/components/QuizCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSectionPage(slug);
  if (!data) return { title: "Section" };
  const { section } = data;
  return {
    title: section.label,
    description: `Trivia quizzes in the “${section.label}” section.`,
  };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const pageData = await loadSectionPage(slug);
  if (!pageData) notFound();
  const { section, quizzes } = pageData;

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:text-amber-400">
        ← Home
      </Link>

      <div className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {section.coverImageUrl ? (
          <div className="relative aspect-[21/9] max-h-[220px] w-full sm:aspect-[3/1] sm:max-h-[280px]">
            <Image
              src={section.coverImageUrl}
              alt={`${section.label} section`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <h1 className="text-2xl font-bold text-white drop-shadow md:text-3xl">{section.label}</h1>
              <p className="mt-1 text-sm text-zinc-300">
                {quizzes.length} quiz{quizzes.length === 1 ? "" : "zes"}
              </p>
            </div>
          </div>
        ) : (
          <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-800 to-zinc-900 px-5 py-8 md:px-8">
            <h1 className="text-2xl font-bold text-zinc-100 md:text-3xl">{section.label}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {quizzes.length} quiz{quizzes.length === 1 ? "" : "zes"} in this section
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
      {quizzes.length === 0 && (
        <p className="text-center text-zinc-500">No quizzes in this section yet.</p>
      )}
    </div>
  );
}
