"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";

type Update = { id: string; mediaUrl: string; caption: string | null; createdAt: string };

export function PhotoUpdates({ bookingId, canPost }: { bookingId: string; canPost: boolean }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const res = await fetch(`/api/bookings/${bookingId}/photos`);
      const data = await res.json();
      if (!cancelled) setUpdates(data.updates ?? []);
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function load() {
    const res = await fetch(`/api/bookings/${bookingId}/photos`);
    const data = await res.json();
    setUpdates(data.updates ?? []);
  }

  async function post() {
    if (!mediaUrl) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl, caption }),
      });
      if (res.ok) {
        setMediaUrl(null);
        setCaption("");
        await load();
      }
    } finally {
      setPosting(false);
    }
  }

  if (updates.length === 0 && !canPost) return null;

  return (
    <Card>
      <h2 className="font-display text-sm font-semibold text-sand">Updates</h2>
      {canPost && (
        <div className="mt-3 space-y-2 rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-3">
          <FileUpload value={mediaUrl} onChange={setMediaUrl} label="photo" preview />
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Coco is enjoying her walk 🐕"
          />
          <Button size="sm" onClick={post} disabled={posting || !mediaUrl}>
            {posting ? "Posting…" : "Send update"}
          </Button>
        </div>
      )}
      {updates.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {updates.map((u) => (
            <div key={u.id} className="overflow-hidden rounded-lg border border-petrol-lighter">
              <Image src={u.mediaUrl} alt={u.caption ?? ""} width={150} height={150} className="h-24 w-full object-cover" />
              {u.caption && <p className="px-2 py-1 text-xs text-sand-dim">{u.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
