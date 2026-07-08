"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-bold text-sand">Reset your password</h1>
      <p className="mt-1 text-sm text-sand-dim">
        Enter your email and we&apos;ll send you a code.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <FieldError message={error ?? undefined} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    </Card>
  );
}
