"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApproveRejectButtons({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    try {
      const res = await fetch(`/api/posts/${postId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    try {
      const res = await fetch(`/api/posts/${postId}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={!!loading}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading === "approve" ? "..." : "Approve"}
      </button>
      <button
        onClick={handleReject}
        disabled={!!loading}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}
