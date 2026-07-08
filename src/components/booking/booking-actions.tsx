"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BookingActions({
  bookingId,
  status,
  viewerRole,
}: {
  bookingId: string;
  status: string;
  viewerRole: "OWNER" | "CAREGIVER";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: string) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const buttons: { action: string; label: string; variant?: "primary" | "secondary" | "outline" }[] = [];

  if (viewerRole === "CAREGIVER") {
    if (status === "REQUESTED") {
      buttons.push({ action: "accept", label: "Accept" });
      buttons.push({ action: "decline", label: "Decline", variant: "outline" });
    }
    if (status === "ACCEPTED") {
      buttons.push({ action: "start", label: "Start visit" });
      buttons.push({ action: "cancel", label: "Cancel", variant: "outline" });
    }
    if (status === "IN_PROGRESS") {
      buttons.push({ action: "complete", label: "Mark complete" });
    }
  }

  if (viewerRole === "OWNER") {
    if (status === "REQUESTED" || status === "ACCEPTED") {
      buttons.push({ action: "cancel", label: "Cancel booking", variant: "outline" });
    }
  }

  if (buttons.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <Button
            key={b.action}
            variant={b.variant}
            size="sm"
            disabled={loading !== null}
            onClick={() => act(b.action)}
          >
            {loading === b.action ? "Working…" : b.label}
          </Button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
