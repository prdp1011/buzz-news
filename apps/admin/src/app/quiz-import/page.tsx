import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { ImportJsonForm } from "./ImportJsonForm";
import { SectionCoverUpload } from "./SectionCoverUpload";

export default async function QuizImportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sections = await prisma.quizSection.findMany({
    orderBy: { label: "asc" },
    select: { id: true, slug: true, label: true, coverImageUrl: true },
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Import quizzes (JSON)</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Paste JSON to create or update sections, quizzes, and questions. New section slugs are
            created automatically. You can set <code className="text-cyan-400">coverImageUrl</code>{" "}
            per section in JSON, or upload a cover per section below.
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
