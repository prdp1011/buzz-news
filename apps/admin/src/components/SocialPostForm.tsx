"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

type SocialPlatform = "INSTAGRAM" | "FACEBOOK" | "YOUTUBE";

type SocialPostWithId = {
  id: string;
  platform: SocialPlatform;
  title: string;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  publishedAt: Date | null;
  status: string;
  externalUrl: string | null;
};

interface SocialPostFormProps {
  post: SocialPostWithId | null;
}

export function SocialPostForm({ post }: SocialPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>(
    (post?.platform as SocialPlatform) ?? "INSTAGRAM"
  );
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(post?.videoUrl ?? "");
  const [status, setStatus] = useState(post?.status ?? "DRAFT");
  const [externalUrl, setExternalUrl] = useState(post?.externalUrl ?? "");

  const isEdit = !!post;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
    const body = {
      platform,
      title,
      content: content || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      publishedAt:
        status === "PUBLISHED"
          ? (post?.publishedAt ?? new Date()).toISOString()
          : null,
      status,
      externalUrl: externalUrl || null,
    };

      const url = isEdit ? `/api/social-posts/${post.id}` : "/api/social-posts";
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
      router.push("/social-posts");
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
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Platform
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        >
          <option value="INSTAGRAM">Instagram</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="YOUTUBE">YouTube</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Content / Caption
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Cover Image
        </label>
        <div className="mt-1">
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            disabled={loading}
          />
        </div>
      </div>
      {platform === "YOUTUBE" && (
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Video URL
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          External URL (link to post on platform)
        </label>
        <input
          type="url"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
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
