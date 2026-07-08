"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-semibold text-petrol"
      >
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-petrol-lighter bg-petrol-light shadow-xl">
          <Link
            href="/settings/profile"
            className="block px-4 py-2 text-sm text-sand hover:bg-petrol-lighter"
            onClick={() => setOpen(false)}
          >
            Profile settings
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-petrol-lighter"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
