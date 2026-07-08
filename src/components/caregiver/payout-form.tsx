"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function PayoutForm({
  initialIban,
  initialBankName,
}: {
  initialIban: string;
  initialBankName: string;
}) {
  const [iban, setIban] = useState(initialIban);
  const [bankName, setBankName] = useState(initialBankName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/caregiver/payout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutIban: iban.toUpperCase().replace(/\s/g, ""), payoutBankName: bankName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="bankName">Bank name</Label>
          <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="iban">IBAN</Label>
          <Input
            id="iban"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="AE07 0331 2345 6789 0123 456"
          />
        </div>
        <FieldError message={error ?? undefined} />
        {saved && <p className="text-sm text-success">Saved.</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save payout details"}
        </Button>
      </form>
    </Card>
  );
}
