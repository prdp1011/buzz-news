import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { ApproveRejectButtons } from "@/components/ApproveRejectButtons";

export default async function DraftsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const drafts = await prisma.post.findMany({
    where: {
      status: { in: ["DRAFT", "PENDING_APPROVAL"] },
    },
    orderBy: { updatedAt: "desc" },
    include: { category: true, source: true },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Drafts & Pending Approval</h1>
      <p className="mt-2 text-zinc-400">
        Review and approve content from the worker or manual drafts.
      </p>
      <div className="mt-6 space-y-4">
        {drafts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div>
              <Link
                href={`/posts/${post.id}`}
                className="font-medium hover:text-cyan-400"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-zinc-500 text-sm">
                {post.category.name} • {post.source.name} •{" "}
                {post.updatedAt.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  post.status === "PENDING_APPROVAL"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-zinc-700 text-zinc-300"
                }`}
              >
                {post.status.replace("_", " ")}
              </span>
              {post.status === "PENDING_APPROVAL" && (
                <ApproveRejectButtons postId={post.id} />
              )}
              <Link
                href={`/posts/${post.id}`}
                className="text-cyan-400 text-sm hover:underline"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
        {drafts.length === 0 && (
          <p className="py-12 text-center text-zinc-500">
            No drafts or pending posts.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
