import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { DeleteButton } from "@/components/DeleteButton";
import { MarkAllApprovedButton } from "@/components/MarkAllApprovedButton";

export default async function PostsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      source: true,
    },
  });

  const pendingCount = posts.filter((p) => p.status === "PENDING_APPROVAL").length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <div className="flex gap-2">
          <MarkAllApprovedButton pendingCount={pendingCount} />
          <Link
            href="/posts/new"
            className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500"
          >
            New Post
          </Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-400 text-sm">
              <th className="pb-4 font-medium">Title</th>
              <th className="pb-4 font-medium">Category</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Updated</th>
              <th className="pb-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-zinc-800/50">
                <td className="py-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="font-medium hover:text-cyan-400"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="py-4 text-zinc-400">{post.category.name}</td>
                <td className="py-4">
                  <StatusBadge status={post.status} />
                </td>
                <td className="py-4 text-zinc-500 text-sm">
                  {post.updatedAt.toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-cyan-400 text-sm hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      postId={post.id}
                      postTitle={post.title}
                      variant="text"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="py-12 text-center text-zinc-500">No posts yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}

function StatusBadge({
  status,
}: {
  status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
}) {
  const styles: Record<string, string> = {
    DRAFT: "bg-zinc-700 text-zinc-300",
    PENDING_APPROVAL: "bg-amber-500/20 text-amber-400",
    PUBLISHED: "bg-emerald-500/20 text-emerald-400",
    REJECTED: "bg-red-500/20 text-red-400",
    ARCHIVED: "bg-zinc-600 text-zinc-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] ?? ""}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
