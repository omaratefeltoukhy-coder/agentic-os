"use client";

import { useMemo, useState } from "react";
import { daySlots, coolHourSlots, minutesToLabel, isHotSlot } from "@/lib/time";
import { DAY_LABELS_FULL } from "@/lib/constants/gulf";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type Slot = { dayOfWeek: number; startMinute: number };

function slotsToMap(slots: Slot[]) {
  const map: Record<number, Set<number>> = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set() };
  for (const s of slots) map[s.dayOfWeek]?.add(s.startMinute);
  return map;
}

export function AvailabilityGrid({
  initialSlots,
  onSaved,
  weekendDays,
}: {
  initialSlots: Slot[];
  onSaved?: (completeness: number) => void;
  weekendDays?: number[];
}) {
  const [map, setMap] = useState(() => slotsToMap(initialSlots));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slots = useMemo(() => daySlots(), []);
  const cool = useMemo(() => new Set(coolHourSlots()), []);

  function replaceDay(day: number, next: Set<number>) {
    setSaved(false);
    setMap((prev) => ({ ...prev, [day]: next }));
  }

  function toggle(day: number, minute: number) {
    const next = new Set(map[day]);
    if (next.has(minute)) next.delete(minute);
    else next.add(minute);
    replaceDay(day, next);
  }

  function selectAll(day: number) {
    replaceDay(day, new Set(slots));
  }

  function coolOnly(day: number) {
    replaceDay(day, new Set(coolHourSlots()));
  }

  function dayOff(day: number) {
    replaceDay(day, new Set());
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const flatSlots: Slot[] = [];
      for (let day = 0; day <= 6; day++) {
        for (const minute of map[day]) flatSlots.push({ dayOfWeek: day, startMinute: minute });
      }
      const res = await fetch("/api/caregiver/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: flatSlots }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save availability.");
        return;
      }
      setSaved(true);
      onSaved?.(data.completeness);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold">
        ☀️ Gulf summers make midday walks risky. Cool-hour slots (05:30–07:00 &amp; 18:30–21:00)
        are highlighted — hot midday slots (11:00–16:00) are flagged.
      </div>

      <div className="mt-4 space-y-5">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <div key={day} data-day={day}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-sand">
                  {DAY_LABELS_FULL[day]}
                </span>
                {weekendDays?.includes(day) && (
                  <span className="rounded-full bg-petrol-lighter px-2 py-0.5 text-[10px] uppercase tracking-wide text-sand-dim">
                    Weekend
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => selectAll(day)}
                  className="rounded-md border border-petrol-lighter px-2 py-1 text-xs text-sand-dim hover:border-gold hover:text-gold"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => coolOnly(day)}
                  className="rounded-md border border-petrol-lighter px-2 py-1 text-xs text-sand-dim hover:border-gold hover:text-gold"
                >
                  Cool hours only
                </button>
                <button
                  type="button"
                  onClick={() => dayOff(day)}
                  className="rounded-md border border-petrol-lighter px-2 py-1 text-xs text-sand-dim hover:border-danger hover:text-danger"
                >
                  Day off
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {slots.map((minute) => {
                const active = map[day].has(minute);
                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => toggle(day, minute)}
                    className={cn(
                      "shrink-0 rounded-md border px-2.5 py-1.5 text-xs tabular-nums transition-colors",
                      active
                        ? "border-gold bg-gold text-petrol font-semibold"
                        : cool.has(minute)
                          ? "border-petrol-lighter bg-petrol-light text-sand-dim"
                          : isHotSlot(minute)
                            ? "border-danger/30 bg-danger/5 text-sand-dim"
                            : "border-petrol-lighter bg-petrol-light text-sand-dim"
                    )}
                  >
                    {minutesToLabel(minute)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save availability"}
        </Button>
        {saved && <span className="text-sm text-success">Saved.</span>}
      </div>
    </div>
  );
}
