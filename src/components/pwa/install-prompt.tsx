"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferredEvent || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-petrol-lighter bg-petrol-light px-4 py-3 shadow-xl shadow-black/40">
      <div className="text-sm text-sand">
        <span className="font-display font-semibold">Install GulfPaws</span>
        <p className="text-xs text-sand-dim">Add to your home screen for one-tap booking.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg px-2 py-1.5 text-xs text-sand-dim hover:text-sand"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={async () => {
            await deferredEvent.prompt();
            await deferredEvent.userChoice;
            setDeferredEvent(null);
          }}
          className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-petrol"
        >
          Install
        </button>
      </div>
    </div>
  );
}
