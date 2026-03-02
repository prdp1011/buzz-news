import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { SocialPostDeleteButton } from "@/components/SocialPostDeleteButton";

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
};

export default async function SocialPostsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await prisma.socialPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Posts</h1>
        <Link
          href="/social-posts/new"
          className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500"
        >
          New Social Post
        </Link>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        Upload posts for Instagram, Facebook & YouTube. Published posts appear in the main feed.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
              <th className="pb-4 font-medium">Title</th>
              <th className="pb-4 font-medium">Platform</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Published</th>
              <th className="pb-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-zinc-800/50">
                <td className="py-4">
                  <Link
                    href={`/social-posts/${post.id}`}
                    className="font-medium hover:text-cyan-400"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="py-4">
                  <span className="rounded-full bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                    {PLATFORM_LABELS[post.platform] ?? post.platform}
                  </span>
                </td>
                <td className="py-4">
                  <StatusBadge status={post.status} />
                </td>
                <td className="py-4 text-sm text-zinc-500">
                  {post.publishedAt
                    ? post.publishedAt.toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/social-posts/${post.id}`}
                      className="text-sm text-cyan-400 hover:underline"
                    >
                      Edit
                    </Link>
                    <SocialPostDeleteButton
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
          <p className="py-12 text-center text-zinc-500">
            No social posts yet. Create one to get started.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

function StatusBadge({
  status,
}: {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
}) {
  const styles: Record<string, string> = {
    DRAFT: "bg-zinc-700 text-zinc-300",
    PUBLISHED: "bg-emerald-500/20 text-emerald-400",
    ARCHIVED: "bg-zinc-600 text-zinc-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] ?? ""}`}
    >
      {status}
    </span>
  );
}
