"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SubscriptionCard({
  plan,
  title,
  price,
  benefits,
  isActive,
}: {
  plan: "OWNER_PLUS" | "CAREGIVER_PRO";
  title: string;
  price: string;
  benefits: string[];
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not subscribe.");
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

  async function cancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={isActive ? "border-gold/50" : undefined}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-sand">{title}</h2>
        {isActive && (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">Active</span>
        )}
      </div>
      <p className="mt-1 font-display text-2xl font-bold text-gold">{price}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-sand-dim">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="text-success">✓</span>
            {b}
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {isActive ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={cancel} disabled={loading}>
          {loading ? "Working…" : "Cancel plan"}
        </Button>
      ) : (
        <Button size="sm" className="mt-4" onClick={subscribe} disabled={loading}>
          {loading ? "Working…" : "Subscribe"}
        </Button>
      )}
    </Card>
  );
}
