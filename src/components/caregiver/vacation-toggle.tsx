"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VacationToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !on;
    try {
      const res = await fetch("/api/caregiver/vacation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVacationMode: next }),
      });
      if (res.ok) {
        setOn(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        on ? "border-gold bg-gold/10 text-gold" : "border-petrol-lighter text-sand-dim hover:text-sand"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${on ? "bg-gold" : "bg-sand-dim"}`} />
      {on ? "On vacation" : "Vacation mode"}
    </button>
  );
}
