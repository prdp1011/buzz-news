"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  postId: string;
  postTitle: string;
  variant?: "icon" | "text";
  className?: string;
  redirectTo?: string; // e.g. "/posts" - redirect after delete (for edit page)
}

export function DeleteButton({
  postId,
  postTitle,
  variant = "text",
  className = "",
  redirectTo,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setConfirming(false);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <span className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-zinc-400">
          Delete &quot;{postTitle.length > 35 ? postTitle.slice(0, 35) + "…" : postTitle}&quot;?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-lg border border-zinc-600 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 ${variant === "icon" ? "p-1.5" : "px-2 py-1 text-sm"} ${className}`}
      title="Delete post"
    >
      {variant === "icon" ? (
        <span aria-hidden>🗑</span>
      ) : (
        "Delete"
      )}
    </button>
  );
}
