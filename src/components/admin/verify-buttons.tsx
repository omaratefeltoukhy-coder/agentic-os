"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function VerifyButtons({ caregiverProfileId }: { caregiverProfileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(status: "APPROVED" | "REJECTED") {
    setLoading(status);
    try {
      await fetch(`/api/admin/caregivers/${caregiverProfileId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act("APPROVED")} disabled={loading !== null}>
        {loading === "APPROVED" ? "Working…" : "Approve"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => act("REJECTED")} disabled={loading !== null}>
        {loading === "REJECTED" ? "Working…" : "Reject"}
      </Button>
    </div>
  );
}
