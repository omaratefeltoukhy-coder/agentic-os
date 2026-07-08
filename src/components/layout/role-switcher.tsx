"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

const ROLE_LABEL: Record<string, string> = { OWNER: "Owner", CAREGIVER: "Caregiver" };

export function RoleSwitcher({ roles, activeRole }: { roles: string[]; activeRole: string }) {
  const { update } = useSession();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function switchTo(role: string) {
    setOpen(false);
    if (role === activeRole) return;
    setPending(true);
    await fetch("/api/user/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, mode: "switch" }),
    });
    // Refresh the JWT cookie so it carries the new activeRole — without
    // this, the DB updates but the session token (and anything reading it,
    // like the header) keeps serving the old role until next sign-in.
    // update() with no argument only GETs the session — passing an object
    // makes next-auth POST and re-run the jwt callback's trigger==="update"
    // branch, which is what actually re-signs the cookie.
    await update({});
    // Full navigation (not router.push/refresh) so every server component in
    // the tree re-renders against the fresh cookie in one paint.
    window.location.assign(role === "CAREGIVER" ? "/dashboard/caregiver" : "/dashboard/owner");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-1.5 text-sm text-sand hover:border-gold"
      >
        {ROLE_LABEL[activeRole] ?? activeRole} mode ▾
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-petrol-lighter bg-petrol-light shadow-xl">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              disabled={pending}
              onClick={() => switchTo(role)}
              className={cn(
                "block w-full px-4 py-2 text-left text-sm hover:bg-petrol-lighter",
                role === activeRole ? "text-gold" : "text-sand"
              )}
            >
              {ROLE_LABEL[role] ?? role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
