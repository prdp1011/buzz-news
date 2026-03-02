"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Source, Tag } from "database";
import { ImageUpload } from "./ImageUpload";

type PostWithTags = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string;
  coverImage?: string | null;
  canonicalUrl?: string | null;
  categoryId?: string;
  sourceId?: string;
  status?: string;
  tags?: { tagId: string }[];
};

interface PostFormProps {
  categories: Category[];
  sources: Source[];
  tags: Tag[];
  post: PostWithTags | null;
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
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [actionLoading, setActionLoading] = useState<
    "rewrite" | "rewriteAll" | "fetch" | null
  >(null);

  const isEdit = !!post;

  async function handleAiRewriteAll() {
    if (!post) return;
    setActionLoading("rewriteAll");
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/ai-rewrite-all`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary ?? "");
        setContent(data.content);
      } else {
        const msg = [data.error, data.hint].filter(Boolean).join(" ");
        setError(msg || "AI rewrite failed");
      }
    } catch {
      setError("AI rewrite failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAiRewrite() {
    if (!post) return;
    setActionLoading("rewrite");
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/ai-rewrite`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setContent(data.content);
      } else {
        const msg = [data.error, data.hint].filter(Boolean).join(" ");
        setError(msg || "AI rewrite failed");
      }
    } catch {
      setError("AI rewrite failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFetchFull() {
    if (!post) return;
    setActionLoading("fetch");
    setError("");
    const urlInput = document.querySelector<HTMLInputElement>('input[name="canonicalUrl"]');
    const url = urlInput?.value?.trim();
    try {
      const res = await fetch(`/api/posts/${post.id}/fetch-full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(url ? { url } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        setContent(data.content);
        if (data.canonicalUrl && urlInput) urlInput.value = data.canonicalUrl;
      } else {
        setError(data.error ?? "Fetch failed");
      }
    } catch {
      setError("Fetch failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const tagIds = formData.getAll("tagIds") as string[];

    const body = {
      title,
      slug,
      summary: summary || null,
      content: content,
      coverImage: coverImage || null,
      canonicalUrl: (formData.get("canonicalUrl") as string) || null,
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
      {isEdit && (
        <div className="rounded-lg border border-amber-600/50 bg-amber-600/10 p-4">
          <p className="mb-2 text-sm font-medium text-amber-400">
            AI Rewrite All (based on full story)
          </p>
          <p className="mb-3 text-xs text-zinc-400">
            Rewrites title, content, and summary from the full article. Use Fetch
            Full Story first if content is empty.
          </p>
          <button
            type="button"
            onClick={handleAiRewriteAll}
            disabled={!!actionLoading}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {actionLoading === "rewriteAll" ? "..." : "AI Rewrite All"}
          </button>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-300">Title</label>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
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
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Article URL (for Fetch Full Story)
          </label>
          <input
            name="canonicalUrl"
            type="url"
            defaultValue={post?.canonicalUrl ?? ""}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
          />
        </div>
      )}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-300">
            Content (HTML)
          </label>
          {isEdit && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFetchFull}
                disabled={!!actionLoading}
                className="rounded-lg border border-amber-600 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-600/20 disabled:opacity-50"
              >
                {actionLoading === "fetch" ? "..." : "Fetch Full Story"}
              </button>
              <button
                type="button"
                onClick={handleAiRewrite}
                disabled={!!actionLoading}
                className="rounded-lg border border-violet-600 px-3 py-1.5 text-sm text-violet-400 hover:bg-violet-600/20 disabled:opacity-50"
              >
                {actionLoading === "rewrite" ? "..." : "AI Rewrite"}
              </button>
            </div>
          )}
        </div>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Cover Image
        </label>
        <div className="mt-1">
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            disabled={loading}
          />
        </div>
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
