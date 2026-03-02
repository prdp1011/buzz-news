import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { SocialPostForm } from "@/components/SocialPostForm";

export default async function EditSocialPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const post = await prisma.socialPost.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Edit Social Post</h1>
      <p className="mt-1 text-sm text-zinc-400">
        {post.platform} • {post.title}
      </p>
      <SocialPostForm
        post={{
          ...post,
          publishedAt: post.publishedAt,
        }}
      />
    </AdminLayout>
  );
}
