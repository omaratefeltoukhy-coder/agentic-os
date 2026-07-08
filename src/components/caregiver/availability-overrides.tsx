"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Override = { date: string; isDayOff: boolean };

export function AvailabilityOverrides({ initial }: { initial: Override[] }) {
  const [overrides, setOverrides] = useState<Override[]>(initial);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function addDayOff() {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch("/api/caregiver/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, isDayOff: true }),
      });
      if (res.ok) {
        setOverrides((prev) => [...prev.filter((o) => o.date !== date), { date, isDayOff: true }]);
        setDate("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove(d: string) {
    await fetch(`/api/caregiver/overrides?date=${d}`, { method: "DELETE" });
    setOverrides((prev) => prev.filter((o) => o.date !== d));
  }

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold text-sand">Days off</h2>
      <p className="mt-1 text-sm text-sand-dim">
        Block a specific date (e.g. a holiday) without changing your weekly schedule.
      </p>
      <div className="mt-3 flex gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
        <Button type="button" onClick={addDayOff} disabled={loading || !date} size="sm">
          Add
        </Button>
      </div>
      {overrides.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {overrides
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((o) => (
              <li
                key={o.date}
                className="flex items-center justify-between rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-2 text-sm"
              >
                <span className="text-sand">{o.date}</span>
                <button
                  type="button"
                  onClick={() => remove(o.date)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
}
