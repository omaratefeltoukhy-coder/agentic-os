"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { GULF_PHONE_CODES, CITY_INFO } from "@/lib/constants/gulf";

type Props = {
  initialName: string;
  initialPhoneCountryCode: string | null;
  initialPhoneNumber: string | null;
  initialWhatsappOptIn: boolean;
  initialCity: string | null;
  initialLocale: string;
};

export function ProfileForm(props: Props) {
  const [name, setName] = useState(props.initialName);
  const [phoneCountryCode, setPhoneCountryCode] = useState(props.initialPhoneCountryCode ?? "+971");
  const [phoneNumber, setPhoneNumber] = useState(props.initialPhoneNumber ?? "");
  const [whatsappOptIn, setWhatsappOptIn] = useState(props.initialWhatsappOptIn);
  const [city, setCity] = useState(props.initialCity ?? "");
  const [locale, setLocale] = useState(props.initialLocale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phoneCountryCode,
          phoneNumber,
          whatsappOptIn,
          city: city || undefined,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save changes.");
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
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-[110px_1fr] gap-2">
          <div>
            <Label htmlFor="phoneCode">Code</Label>
            <Select
              id="phoneCode"
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
            >
              {GULF_PHONE_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-sand-dim">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="h-4 w-4 rounded border-petrol-lighter accent-[#e8a94b]"
          />
          Send me booking updates on WhatsApp
        </label>

        <div>
          <Label htmlFor="city">City</Label>
          <Select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Select a city</option>
            {Object.entries(CITY_INFO).map(([code, info]) => (
              <option key={code} value={code}>
                {info.label} ({info.country})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="locale">Language</Label>
          <Select id="locale" value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
          </Select>
        </div>

        <FieldError message={error ?? undefined} />
        {saved && <p className="text-sm text-success">Saved.</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
