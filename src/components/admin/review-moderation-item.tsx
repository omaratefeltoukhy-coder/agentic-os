"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReviewModerationItem({
  id,
  authorName,
  subjectName,
  rating,
  comment,
}: {
  id: string;
  authorName: string;
  subjectName: string;
  rating: number;
  comment: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Delete this review?")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm text-sand-dim">
          {authorName} → {subjectName}
        </div>
        <div className="text-gold">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</div>
        {comment && <p className="mt-1 text-sm text-sand-dim">{comment}</p>}
      </div>
      <Button size="sm" variant="outline" onClick={remove} disabled={loading}>
        {loading ? "Working…" : "Delete"}
      </Button>
    </Card>
  );
}
