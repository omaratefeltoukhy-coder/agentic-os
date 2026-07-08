"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FeaturedPurchase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function boost() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/caregiver/featured", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      <Button onClick={boost} disabled={loading}>
        {loading ? "Starting…" : "Boost for 7 days"}
      </Button>
    </div>
  );
}
