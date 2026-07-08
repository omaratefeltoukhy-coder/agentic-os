"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import {
  GULF_CITIES,
  CITY_INFO,
  NEIGHBORHOODS,
  MARKET_RATE_RANGE,
  LAUNCH_SERVICE_TYPES,
  SERVICE_LABELS,
  LANGUAGES,
  LANGUAGE_LABELS,
  type GulfCityCode,
} from "@/lib/constants/gulf";

type Props = {
  initial: {
    city: GulfCityCode | null;
    areas: string[];
    services: string[];
    hourlyRate: number | null;
    languages: string[];
    bio: string;
    yearsExperience: number | null;
    photoUrl: string | null;
    certificationUrls: string[];
  };
  onSaved: (completeness: number) => void;
  submitLabel?: string;
};

export function CaregiverProfileForm({ initial, onSaved, submitLabel = "Save & continue" }: Props) {
  const [city, setCity] = useState<GulfCityCode>(initial.city ?? "DUBAI");
  const [areas, setAreas] = useState<string[]>(initial.areas);
  const [services, setServices] = useState<string[]>(initial.services);
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate?.toString() ?? "");
  const [languages, setLanguages] = useState<string[]>(initial.languages);
  const [bio, setBio] = useState(initial.bio);
  const [yearsExperience, setYearsExperience] = useState(initial.yearsExperience?.toString() ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl);
  const [certificationUrls, setCertificationUrls] = useState<string[]>(initial.certificationUrls);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = MARKET_RATE_RANGE[city];
  const currency = CITY_INFO[city].currency;

  function toggleArea(area: string) {
    setAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  function toggleService(service: string) {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  function toggleLanguage(lang: string) {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/caregiver/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          areas,
          services,
          hourlyRate: Number(hourlyRate),
          currency,
          languages,
          bio,
          yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
          photoUrl,
          certificationUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save your profile.");
        return;
      }
      onSaved(data.completeness);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>Profile photo</Label>
          <FileUpload value={photoUrl} onChange={setPhotoUrl} label="photo" />
          <p className="mt-1 text-xs text-sand-dim">Profiles with photos get 3× more bookings.</p>
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Select
            id="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value as GulfCityCode);
              setAreas([]);
            }}
          >
            {GULF_CITIES.map((c) => (
              <option key={c} value={c}>
                {CITY_INFO[c].label} ({CITY_INFO[c].country})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Areas you cover</Label>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS[city].map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  areas.includes(area)
                    ? "border-gold bg-gold text-petrol font-medium"
                    : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Services offered</Label>
          <div className="flex flex-wrap gap-2">
            {LAUNCH_SERVICE_TYPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  services.includes(s)
                    ? "border-gold bg-gold text-petrol font-medium"
                    : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
                }`}
              >
                {SERVICE_LABELS[s]}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-sand-dim">
            Pet boarding, grooming, taxi &amp; vet visits are coming soon.
          </p>
        </div>

        <div>
          <Label htmlFor="rate">Hourly rate ({currency})</Label>
          <Input
            id="rate"
            type="number"
            min={10}
            step={1}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-sand-dim">
            Most walkers in {CITY_INFO[city].label} charge {range.min}–{range.max} {currency}/hr.
          </p>
        </div>

        <div>
          <Label>Languages spoken</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleLanguage(l)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  languages.includes(l)
                    ? "border-gold bg-gold text-petrol font-medium"
                    : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
                }`}
              >
                {LANGUAGE_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Short bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full rounded-lg bg-petrol-light border border-petrol-lighter px-4 py-3 text-sand placeholder:text-sand-dim/60 outline-none transition-colors focus:border-gold"
            placeholder="Tell owners about your experience with pets…"
          />
        </div>

        <div>
          <Label htmlFor="years">Years of experience</Label>
          <Input
            id="years"
            type="number"
            min={0}
            max={60}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          />
        </div>

        <div>
          <Label>Certifications (optional)</Label>
          <FileUpload
            value={null}
            preview={false}
            accept="image/jpeg,image/png,application/pdf"
            label="certificate"
            onChange={(url) => {
              if (url) setCertificationUrls((prev) => [...prev, url].slice(0, 5));
            }}
          />
          {certificationUrls.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-sand-dim">
              {certificationUrls.map((url, i) => (
                <li key={url} className="flex items-center justify-between">
                  <span>Certificate {i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCertificationUrls((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-xs text-danger hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FieldError message={error ?? undefined} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
