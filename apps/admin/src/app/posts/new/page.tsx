import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { PostForm } from "@/components/PostForm";

export default async function NewPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [categories, sources, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.source.findMany({ where: { isActive: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">New Post</h1>
      <PostForm
        categories={categories}
        sources={sources}
        tags={tags}
        post={null}
      />
    </AdminLayout>
  );
}
