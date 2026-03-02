import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLayout } from "@/components/AdminLayout";
import { SocialPostForm } from "@/components/SocialPostForm";

export default async function NewSocialPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">New Social Post</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Create a post for Instagram, Facebook, or YouTube. Published posts appear in the main feed.
      </p>
      <SocialPostForm post={null} />
    </AdminLayout>
  );
}
