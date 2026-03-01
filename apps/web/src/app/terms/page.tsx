import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Buzz News terms of service. Read the terms governing your use of our platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400"
      >
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-zinc-100">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      <div className="prose prose-invert prose-zinc mt-8 max-w-none space-y-8 text-zinc-300">
        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Buzz News (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service. If you do not agree, do not
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            2. Description of Service
          </h2>
          <p>
            Buzz News provides aggregated news content, summaries, and related
            features. Content is sourced from third-party publishers and RSS
            feeds. We use AI to generate summaries and enhance readability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            3. Use of Service
          </h2>
          <p>You agree to use the Service only for lawful purposes. You will not:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property or other rights</li>
            <li>Attempt to gain unauthorized access to our systems or data</li>
            <li>Use automated means to scrape or overload the Service</li>
            <li>Transmit malware or harmful code</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            4. Intellectual Property and Content
          </h2>
          <p>
            Original articles and images are owned by their respective
            publishers. Buzz News does not claim ownership of sourced content.
            Our summaries, design, and branding are our intellectual property.
            Use of our content for commercial purposes without permission is
            prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            5. Disclaimer of Warranties
          </h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            We do not warrant that the Service will be uninterrupted, error-free,
            or free of harmful components. AI-generated content may contain
            inaccuracies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            6. Limitation of Liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUZZ NEWS AND ITS AFFILIATES
            SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE
            SERVICE.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            7. DMCA and Copyright
          </h2>
          <p>
            We respect intellectual property rights. If you believe content on
            our site infringes your copyright, please send a DMCA notice to{" "}
            <a
              href="mailto:dmca@buzznews.com"
              className="text-amber-400 hover:underline"
            >
              dmca@buzznews.com
            </a>{" "}
            with the required information under 17 U.S.C. § 512(c)(3).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            8. Termination
          </h2>
          <p>
            We may suspend or terminate your access to the Service at any time,
            with or without cause. Upon termination, your right to use the
            Service ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            9. Governing Law
          </h2>
          <p>
            These Terms are governed by the laws of the United States. Any
            disputes shall be resolved in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            10. Changes
          </h2>
          <p>
            We may modify these Terms at any time. Continued use of the Service
            after changes constitutes acceptance. We encourage you to review
            this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">11. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a
              href="mailto:legal@buzznews.com"
              className="text-amber-400 hover:underline"
            >
              legal@buzznews.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
