"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReviewForm({ bookingId, subjectLabel }: { bookingId: string; subjectLabel: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit review.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-petrol-lighter bg-petrol-light px-4 py-3">
      <p className="text-sm font-medium text-sand">Rate {subjectLabel}</p>
      <div className="mt-2 flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={n <= rating ? "text-gold" : "text-sand-dim/30"}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Optional comment…"
        className="mt-2 w-full rounded-lg bg-petrol-lighter border border-petrol-lighter px-3 py-2 text-sm text-sand placeholder:text-sand-dim/60 outline-none focus:border-gold"
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      <Button size="sm" className="mt-2" onClick={submit} disabled={loading}>
        {loading ? "Submitting…" : "Submit review"}
      </Button>
    </div>
  );
}
