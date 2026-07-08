"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Promo = {
  id: string;
  code: string;
  description: string | null;
  percentOff: number | null;
  fixedAmountOff: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  firstBookingOnly: boolean;
  isActive: boolean;
};

export function PromoManager({ initial }: { initial: Promo[] }) {
  const [promos, setPromos] = useState(initial);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [firstBookingOnly, setFirstBookingOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          percentOff: percentOff ? Number(percentOff) : undefined,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          firstBookingOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create promo.");
        return;
      }
      setPromos((prev) => [data.promo, ...prev]);
      setCode("");
      setDescription("");
      setPercentOff("");
      setMaxRedemptions("");
      setFirstBookingOnly(false);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/admin/promos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, isActive } : p)));
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-sm font-semibold text-sand">Create promo code</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="p-code">Code</Label>
            <Input id="p-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </div>
          <div>
            <Label htmlFor="p-percent">Percent off</Label>
            <Input id="p-percent" type="number" value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="p-desc">Description</Label>
            <Input id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-max">Max redemptions</Label>
            <Input
              id="p-max"
              type="number"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="Unlimited"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-sand-dim">
              <input
                type="checkbox"
                checked={firstBookingOnly}
                onChange={(e) => setFirstBookingOnly(e.target.checked)}
                className="h-4 w-4 rounded border-petrol-lighter accent-[#e8a94b]"
              />
              First booking only
            </label>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <Button size="sm" className="mt-3" onClick={create} disabled={loading || !code || !percentOff}>
          {loading ? "Creating…" : "Create"}
        </Button>
      </Card>

      <div className="space-y-2">
        {promos.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <div className="font-mono text-sm text-sand">{p.code}</div>
              <div className="text-xs text-sand-dim">
                {p.percentOff ? `${p.percentOff}% off` : `${p.fixedAmountOff} off`}
                {p.firstBookingOnly && " · first booking only"}
                {" · "}
                {p.redemptionCount}
                {p.maxRedemptions ? `/${p.maxRedemptions}` : ""} used
              </div>
            </div>
            <Button
              size="sm"
              variant={p.isActive ? "outline" : "secondary"}
              onClick={() => toggle(p.id, !p.isActive)}
            >
              {p.isActive ? "Deactivate" : "Activate"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
