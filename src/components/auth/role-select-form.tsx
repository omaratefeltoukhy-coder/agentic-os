"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Role = "OWNER" | "CAREGIVER";

export function RoleSelectForm() {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const suggested = searchParams.get("suggested");

  const [role, setRole] = useState<Role>(suggested === "caregiver" ? "CAREGIVER" : "OWNER");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    const res = await fetch("/api/user/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, mode: "select" }),
    });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    // Refresh the JWT cookie so it carries the new role before navigating.
    // update() with no argument only GETs the session — passing an object
    // makes next-auth POST and re-run the jwt callback's trigger==="update"
    // branch, which is what actually re-signs the cookie.
    await update({});
    window.location.assign(role === "CAREGIVER" ? "/onboarding/caregiver" : "/browse");
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-bold text-sand">One quick thing</h1>
      <p className="mt-1 text-sm text-sand-dim">How will you use GulfPaws?</p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => setRole("OWNER")}
          className={`w-full rounded-xl border p-4 text-left transition-colors ${
            role === "OWNER"
              ? "border-gold bg-gold/10"
              : "border-petrol-lighter hover:border-sand-dim/50"
          }`}
        >
          <div className="text-2xl">🐾</div>
          <div className="mt-1 font-display font-semibold text-sand">I&apos;m a pet owner</div>
          <div className="text-sm text-sand-dim">I want to book walkers and sitters.</div>
        </button>

        <button
          type="button"
          onClick={() => setRole("CAREGIVER")}
          className={`w-full rounded-xl border p-4 text-left transition-colors ${
            role === "CAREGIVER"
              ? "border-gold bg-gold/10"
              : "border-petrol-lighter hover:border-sand-dim/50"
          }`}
        >
          <div className="text-2xl">🐕</div>
          <div className="mt-1 font-display font-semibold text-sand">I offer pet care</div>
          <div className="text-sm text-sand-dim">I want to walk dogs or sit cats and get paid.</div>
        </button>
      </div>

      <Button className="mt-6 w-full" onClick={confirm} disabled={loading}>
        {loading ? "Saving…" : "Continue"}
      </Button>

      <p className="mt-4 text-center text-xs text-sand-dim">
        You can add the other role later from your profile.
      </p>
    </Card>
  );
}
