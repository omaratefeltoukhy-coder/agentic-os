"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function SettingsForm({ defaultRate, proRate }: { defaultRate: number; proRate: number }) {
  const [defaultPct, setDefaultPct] = useState((defaultRate * 100).toString());
  const [proPct, setProPct] = useState((proRate * 100).toString());
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCommissionRate: Number(defaultPct) / 100,
          proCommissionRate: Number(proPct) / 100,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-sm font-semibold text-sand">Commission rates</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="default-rate">Standard commission (%)</Label>
          <Input id="default-rate" type="number" value={defaultPct} onChange={(e) => setDefaultPct(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="pro-rate">Caregiver Pro commission (%)</Label>
          <Input id="pro-rate" type="number" value={proPct} onChange={(e) => setProPct(e.target.value)} />
        </div>
      </div>
      {saved && <p className="mt-2 text-sm text-success">Saved — applies to new bookings.</p>}
      <Button size="sm" className="mt-3" onClick={save} disabled={loading}>
        {loading ? "Saving…" : "Save rates"}
      </Button>
    </Card>
  );
}
