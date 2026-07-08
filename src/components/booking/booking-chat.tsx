"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { id: string; body: string; senderId: string; createdAt: string; sender: { name: string | null } };

export function BookingChat({ bookingId, currentUserId }: { bookingId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const res = await fetch(`/api/bookings/${bookingId}/messages`);
      const data = await res.json();
      if (!cancelled) setMessages(data.messages ?? []);
    }
    poll();
    const interval = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId]);

  async function reload() {
    const res = await fetch(`/api/bookings/${bookingId}/messages`);
    const data = await res.json();
    setMessages(data.messages ?? []);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        setText("");
        await reload();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-sm font-semibold text-sand">Chat</h2>
      <p className="text-xs text-sand-dim">Phone numbers stay private — chat here instead.</p>
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.length === 0 && <p className="text-sm text-sand-dim">No messages yet — say hello.</p>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.senderId === currentUserId
                ? "ml-auto bg-gold text-petrol"
                : "bg-petrol-lighter text-sand"
            }`}
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
        />
        <Button size="sm" onClick={send} disabled={loading || !text.trim()}>
          Send
        </Button>
      </div>
    </Card>
  );
}
