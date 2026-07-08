"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function BecomeCaregiverButton() {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    await fetch("/api/user/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "CAREGIVER", mode: "add" }),
    });
    // Refresh the JWT cookie so it carries the new role before reloading.
    // update() with NO argument only re-fetches (GET) — passing an object
    // is what makes next-auth POST and re-run the jwt callback's
    // trigger==="update" branch, which is what actually re-signs the cookie.
    await update({});
    window.location.reload();
  }

  return (
    <Button onClick={start} disabled={loading} className="mt-4">
      {loading ? "Setting up…" : "Start caregiver onboarding"}
    </Button>
  );
}
