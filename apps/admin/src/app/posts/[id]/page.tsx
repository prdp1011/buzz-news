import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { PostForm } from "@/components/PostForm";
import { ApproveRejectButtons } from "@/components/ApproveRejectButtons";
import { DeleteButton } from "@/components/DeleteButton";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const [post, categories, sources, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.source.findMany({ where: { isActive: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <div className="flex items-center gap-2">
          {post.status === "PENDING_APPROVAL" && (
            <ApproveRejectButtons postId={post.id} />
          )}
          <DeleteButton
            postId={post.id}
            postTitle={post.title}
            variant="text"
            redirectTo="/posts"
          />
          <Link
            href="/posts"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
          >
            Back
          </Link>
        </div>
      </div>
      <PostForm
        categories={categories}
        sources={sources}
        tags={tags}
        post={post}
      />
    </AdminLayout>
  );
}
