import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Buzz News privacy policy. Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400"
      >
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-zinc-100">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      <div className="prose prose-invert prose-zinc mt-8 max-w-none space-y-8 text-zinc-300">
        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            1. Information We Collect
          </h2>
          <p>
            Buzz News may collect information when you use our website,
            including:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Usage data:</strong> Pages visited, time spent, and
              navigation paths
            </li>
            <li>
              <strong>Device information:</strong> Browser type, operating
              system, and IP address
            </li>
            <li>
              <strong>Cookies and similar technologies:</strong> To improve
              functionality and analyze traffic
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            2. How We Use Your Information
          </h2>
          <p>We use collected information to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Understand how visitors use our site</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            3. Cookies and Tracking
          </h2>
          <p>
            We use cookies and similar technologies for analytics and to
            enhance your experience. You can control cookie preferences through
            your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            4. Third-Party Services
          </h2>
          <p>
            Our site may integrate with third-party services (e.g., analytics,
            hosting). These services have their own privacy policies governing
            their use of data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            5. Data Retention and Security
          </h2>
          <p>
            We retain data only as long as necessary for the purposes
            described. We implement appropriate technical and organizational
            measures to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            6. Your Rights
          </h2>
          <p>
            Depending on your location, you may have rights to access, correct,
            delete, or restrict processing of your personal data. Contact us to
            exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            7. Children&apos;s Privacy
          </h2>
          <p>
            Our service is not directed to individuals under 13. We do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the updated policy on this page
            with a new &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">9. Contact</h2>
          <p>
            For questions about this Privacy Policy, contact us at{" "}
            <a
              href="mailto:privacy@buzznews.com"
              className="text-amber-400 hover:underline"
            >
              privacy@buzznews.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
