"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Source, Tag, Post } from "database";

interface PostFormProps {
  categories: Category[];
  sources: Source[];
  tags: Tag[];
  post: Post | null;
}

export function PostForm({
  categories,
  sources,
  tags,
  post,
}: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!post;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const tagIds = formData.getAll("tagIds") as string[];

    const body = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      summary: (formData.get("summary") as string) || null,
      content: formData.get("content") as string,
      coverImage: (formData.get("coverImage") as string) || null,
      categoryId: formData.get("categoryId") as string,
      sourceId: formData.get("sourceId") as string,
      status: formData.get("status") as string,
      tagIds,
    };

    try {
      const url = isEdit ? `/api/posts/${post.id}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      router.push("/posts");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-red-400 text-sm">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-300">Title</label>
        <input
          name="title"
          defaultValue={post?.title}
          required
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">Slug</label>
        <input
          name="slug"
          defaultValue={post?.slug}
          required
          placeholder="url-friendly-slug"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Summary
        </label>
        <textarea
          name="summary"
          defaultValue={post?.summary ?? ""}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Content (HTML)
        </label>
        <textarea
          name="content"
          defaultValue={post?.content}
          required
          rows={12}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Cover Image URL
        </label>
        <input
          name="coverImage"
          type="url"
          defaultValue={post?.coverImage ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Category
          </label>
          <select
            name="categoryId"
            defaultValue={post?.categoryId}
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Source
          </label>
          <select
            name="sourceId"
            defaultValue={post?.sourceId}
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">Status</label>
        <select
          name="status"
          defaultValue={post?.status}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        >
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">Tags</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                defaultChecked={post?.tags?.some((t) => t.tagId === tag.id)}
                className="rounded border-zinc-600"
              />
              <span className="text-sm">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-6 py-2 font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-700 px-6 py-2 text-zinc-300 hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
