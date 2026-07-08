"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReferralShare({ link, whatsappLink }: { link: string; whatsappLink: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold text-sand">Invite friends</h2>
      <p className="mt-1 text-sm text-sand-dim">
        Share your link — you both get booking credit when they complete their first booking.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 truncate rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-2 text-sm text-sand-dim">
          {link}
        </div>
        <Button size="sm" onClick={copy}>
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success"
      >
        Share on WhatsApp
      </a>
    </Card>
  );
}
