import type { Metadata } from "next";
import Link from "next/link";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME} — quick trivia quizzes, topics, and instant scoring.`,
  alternates: { canonical: `${getBaseUrl()}/about` },
  openGraph: { url: `${getBaseUrl()}/about`, type: "website" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400 md:mb-8"
      >
        ← Back to Home
      </Link>

      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-2xl md:text-4xl">🧠</span>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100">About {SITE_NAME}</h1>
      </div>

      <div className="prose prose-sm prose-invert prose-zinc mt-6 max-w-none space-y-6 text-zinc-300 md:mt-8">
        <p className="text-base">
          {SITE_NAME} is a lightweight trivia web app: choose a quiz, answer
          multiple-choice questions one at a time, then see your score and a
          quick review of what you got right or wrong.
        </p>

        <section>
          <h2 className="text-base font-semibold text-zinc-100 md:text-lg">How it works</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Browse</strong> quizzes on the home page or by topic in the sidebar.
            </li>
            <li>
              <strong>Play</strong> — each step shows one question and four options.
            </li>
            <li>
              <strong>Finish</strong> — your score is computed on the server so answers stay fair.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-100 md:text-lg">Contact</h2>
          <p>
            Feedback or ideas? Reach us at{" "}
            <a
              href="mailto:buzznnews@gmail.com"
              className="text-amber-400 hover:underline"
            >
              buzznnews@gmail.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 flex gap-4">
        <Link
          href="/privacy"
          className="text-sm text-zinc-500 hover:text-amber-400"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-sm text-zinc-500 hover:text-amber-400"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
