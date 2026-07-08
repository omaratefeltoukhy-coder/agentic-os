"use client";

import { useTransition } from "react";
import { useSession } from "next-auth/react";

export function LocaleSwitcher({ current }: { current: string }) {
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();

  function setLocale(locale: "en" | "ar") {
    if (locale === current || pending) return;
    document.cookie = `gp_locale=${locale}; path=/; max-age=31536000`;

    startTransition(async () => {
      if (session?.user) {
        await fetch("/api/user/locale", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        }).catch(() => null);
      }
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-petrol-lighter bg-petrol-light p-0.5 text-xs">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-md px-2 py-1 ${current === "en" ? "bg-gold text-petrol font-semibold" : "text-sand-dim"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={`rounded-md px-2 py-1 ${current === "ar" ? "bg-gold text-petrol font-semibold" : "text-sand-dim"}`}
      >
        AR
      </button>
    </div>
  );
}
