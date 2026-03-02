import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Buzz News — AI-powered news summaries, no paywalls, multiple perspectives.",
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
        <span className="text-2xl md:text-4xl">✨</span>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100">About Buzz News</h1>
      </div>

      <div className="prose prose-sm prose-invert prose-zinc mt-6 max-w-none space-y-6 text-zinc-300 md:mt-8">
        <p className="text-base">
          Buzz News is your daily dose of news that actually hits different. We
          aggregate stories from trusted sources and use AI to deliver clear,
          concise summaries — so you stay informed without the noise.
        </p>

        <section>
          <h2 className="text-base font-semibold text-zinc-100 md:text-lg">Our Mission</h2>
          <p>
            We believe everyone deserves access to quality news. By combining
            aggregation, AI summarization, and a clean reading experience, we
            make it easier to stay informed across tech, culture, lifestyle,
            and more — without paywalls or endless scrolling.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-100 md:text-lg">What We Do</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Aggregate:</strong> We pull stories from reputable RSS
              feeds and sources
            </li>
            <li>
              <strong>Summarize:</strong> AI helps us create clear, scannable
              summaries
            </li>
            <li>
              <strong>Organize:</strong> Browse by category and tags to find
              what matters to you
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-100 md:text-lg">Contact</h2>
          <p>
            Have feedback, partnership ideas, or press inquiries? Reach us at{" "}
            <a
              href="mailto:support@buzznews.com"
              className="text-amber-400 hover:underline"
            >
              support@buzznews.com
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
