"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MarkAllApprovedButtonProps {
  pendingCount: number;
  className?: string;
}

export function MarkAllApprovedButton({
  pendingCount,
  className = "",
}: MarkAllApprovedButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/approve-all", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.count > 0) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (pendingCount === 0) return null;

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className={`rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 ${className}`}
    >
      {loading ? "..." : `Approve All (${pendingCount})`}
    </button>
  );
}
