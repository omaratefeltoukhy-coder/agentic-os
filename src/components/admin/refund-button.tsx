"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RefundButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function refund() {
    if (!confirm("Refund this booking? This cancels it and reverses payment.")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/bookings/${bookingId}/refund`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={refund} disabled={loading}>
      {loading ? "Working…" : "Refund & cancel"}
    </Button>
  );
}
