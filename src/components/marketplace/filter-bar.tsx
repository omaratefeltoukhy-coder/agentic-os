"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Select, Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GULF_CITIES,
  CITY_INFO,
  LAUNCH_SERVICE_TYPES,
  SERVICE_LABELS,
  LANGUAGES,
  LANGUAGE_LABELS,
} from "@/lib/constants/gulf";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [service, setService] = useState(searchParams.get("service") ?? "");
  const [language, setLanguage] = useState(searchParams.get("language") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [verified, setVerified] = useState(searchParams.get("verified") === "1");
  const [date, setDate] = useState(searchParams.get("date") ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (service) params.set("service", service);
    if (language) params.set("language", language);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (verified) params.set("verified", "1");
    if (date) params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setCity("");
    setService("");
    setLanguage("");
    setMaxPrice("");
    setVerified(false);
    setDate("");
    router.push(pathname);
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-petrol-lighter bg-petrol-light/60 p-4 sm:grid-cols-3 lg:grid-cols-6">
      <div>
        <Label htmlFor="f-city">City</Label>
        <Select id="f-city" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Any city</option>
          {GULF_CITIES.map((c) => (
            <option key={c} value={c}>
              {CITY_INFO[c].label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="f-service">Service</Label>
        <Select id="f-service" value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">Any service</option>
          {LAUNCH_SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="f-lang">Language</Label>
        <Select id="f-lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">Any language</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {LANGUAGE_LABELS[l]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="f-price">Max rate/hr</Label>
        <Input
          id="f-price"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Any"
        />
      </div>
      <div>
        <Label htmlFor="f-date">Available on</Label>
        <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="flex flex-col justify-end gap-2">
        <label className="flex items-center gap-2 text-sm text-sand-dim">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="h-4 w-4 rounded border-petrol-lighter accent-[#e8a94b]"
          />
          Verified only
        </label>
      </div>
      <div className="col-span-2 flex gap-2 sm:col-span-3 lg:col-span-6">
        <Button type="button" onClick={apply} size="sm">
          Apply filters
        </Button>
        <Button type="button" onClick={clear} variant="ghost" size="sm">
          Clear
        </Button>
      </div>
    </div>
  );
}
