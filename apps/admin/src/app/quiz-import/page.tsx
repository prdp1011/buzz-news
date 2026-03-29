import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { readSectionIndex } from "@/lib/quiz-file-store";
import { AdminLayout } from "@/components/AdminLayout";
import { ImportJsonForm } from "./ImportJsonForm";
import { SectionCoverUpload } from "./SectionCoverUpload";

export default async function QuizImportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const idx = await readSectionIndex();
  const sections = idx.sections
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((s) => ({
      slug: s.slug,
      label: s.label,
      coverImageUrl: typeof s.coverImageUrl === "string" ? s.coverImageUrl : "",
    }));

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Import quizzes (JSON)</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Writes directly to <code className="text-cyan-400">apps/web/data/section.json</code> and{" "}
            <code className="text-cyan-400">section-wise-question/*.json</code> (same files the public site reads). You
            can set <code className="text-cyan-400">coverImageUrl</code> in JSON or upload below.
          </p>
        </div>

        <ImportJsonForm />

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-200">Section cover images</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Upload sets the public section hero image (same as{" "}
            <code className="text-zinc-400">coverImageUrl</code> in JSON). Requires{" "}
            <code className="text-zinc-400">CLOUDINARY_*</code> env vars.
          </p>
          <div className="mt-6">
            <SectionCoverUpload sections={sections} />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
