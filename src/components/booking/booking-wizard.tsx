"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/button";
import { computeBookingPrice } from "@/lib/pricing";
import {
  formatMoney,
  SERVICE_LABELS,
  type CurrencyCode,
} from "@/lib/constants/gulf";
import { DURATION_OPTIONS, durationLabel, minutesToLabel, nextNDays, toDateKey, isHotSlot } from "@/lib/time";
import { cn } from "@/lib/cn";

type Pet = { id: string; name: string; type: string };

export function BookingWizard({
  caregiverProfileId,
  caregiverName,
  services,
  hourlyRate,
  currency,
  isProBadge,
  pets,
}: {
  caregiverProfileId: string;
  caregiverName: string;
  services: string[];
  hourlyRate: number;
  currency: CurrencyCode;
  isProBadge: boolean;
  pets: Pet[];
}) {
  const days = useMemo(() => nextNDays(14), []);

  const [service, setService] = useState(services[0] ?? "");
  const [dayAvailability, setDayAvailability] = useState<Record<string, boolean> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [slotsData, setSlotsData] = useState<{ key: string; slots: number[] } | null>(null);
  const [selectedStartMinute, setSelectedStartMinute] = useState<number | null>(null);
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [repeat, setRepeat] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [firstBookingId, setFirstBookingId] = useState<string | null>(null);

  const slotsKey = selectedDate ? `${selectedDate}:${duration}` : null;
  const slots = slotsData?.key === slotsKey ? slotsData.slots : null;
  const slotsLoading = slotsKey !== null && slots === null;
  // Discard a previously picked time once the date/duration no longer matches
  // (e.g. the caregiver's slot for it disappeared, or duration changed).
  const startMinute = slots?.includes(selectedStartMinute ?? -1) ? selectedStartMinute : null;

  useEffect(() => {
    fetch(`/api/caregivers/${caregiverProfileId}/calendar`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, boolean> = {};
        for (const d of data.days) map[d.date] = d.available;
        setDayAvailability(map);
      });
  }, [caregiverProfileId]);

  useEffect(() => {
    if (!selectedDate || !slotsKey) return;
    let cancelled = false;
    fetch(`/api/caregivers/${caregiverProfileId}/availability?date=${selectedDate}&duration=${duration}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlotsData({ key: slotsKey, slots: data.slots ?? [] });
      });
    return () => {
      cancelled = true;
    };
  }, [caregiverProfileId, selectedDate, duration, slotsKey]);

  const price = computeBookingPrice({
    hourlyRate,
    durationMinutes: duration,
    currency,
    isProBadge,
  });

  async function submit() {
    if (!selectedDate || startMinute === null || !petId) return;
    setSubmitting(true);
    setError(null);
    try {
      const occurrences = repeat ? repeatWeeks : 1;
      let checkoutUrl: string | null = null;
      let firstId: string | null = null;
      let successCount = 0;

      for (let i = 0; i < occurrences; i++) {
        const base = new Date(`${selectedDate}T00:00:00.000Z`);
        base.setUTCDate(base.getUTCDate() + i * 7);
        const dateStr = toDateKey(base);

        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caregiverProfileId,
            petId,
            serviceType: service,
            date: dateStr,
            startMinute,
            durationMinutes: duration,
            ownerNote: note,
            paymentMethod,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(
            i === 0
              ? data.error ?? "Could not create booking."
              : `${successCount} of ${occurrences} bookings created — stopped at week ${i + 1}: ${data.error}`
          );
          break;
        }
        successCount++;
        if (i === 0) {
          firstId = data.booking.id;
          checkoutUrl = data.checkoutUrl;
        }
      }

      if (successCount > 0) {
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }
        setConfirmedCount(successCount);
        setFirstBookingId(firstId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedCount !== null) {
    return (
      <Card className="text-center">
        <div className="text-3xl">✅</div>
        <h2 className="mt-2 font-display text-xl font-bold text-sand">
          {confirmedCount > 1 ? `${confirmedCount} bookings requested` : "Booking requested"}
        </h2>
        <p className="mt-2 text-sm text-sand-dim">
          We&apos;ve sent your request to {caregiverName}. They have 2 hours to accept — you&apos;ll
          get an email the moment they respond.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          {firstBookingId && (
            <LinkButton href={`/dashboard/owner/bookings/${firstBookingId}`}>
              View booking
            </LinkButton>
          )}
          <LinkButton href="/dashboard/owner/bookings" variant="secondary">
            All bookings
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold text-sand">Book {caregiverName}</h2>

      <div className="mt-4">
        <Label>Service</Label>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setService(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                service === s
                  ? "border-gold bg-gold text-petrol font-medium"
                  : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
              )}
            >
              {SERVICE_LABELS[s as keyof typeof SERVICE_LABELS]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Label>Date</Label>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map((d) => {
            const key = toDateKey(d);
            const available = dayAvailability?.[key];
            const disabled = available === false;
            return (
              <button
                key={key}
                type="button"
                data-date={key}
                disabled={disabled || dayAvailability === null}
                onClick={() => setSelectedDate(key)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2 text-center text-xs transition-colors",
                  selectedDate === key
                    ? "border-gold bg-gold text-petrol font-semibold"
                    : disabled
                      ? "border-petrol-lighter text-sand-dim/30 cursor-not-allowed"
                      : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
                )}
              >
                <div>{d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</div>
                <div className="font-medium">{d.getUTCDate()}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Label>Duration</Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                duration === d
                  ? "border-gold bg-gold text-petrol font-medium"
                  : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
              )}
            >
              {durationLabel(d)}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-4">
          <Label>Start time</Label>
          {slotsLoading ? (
            <p className="text-sm text-sand-dim">Loading times…</p>
          ) : slots && slots.length === 0 ? (
            <p className="text-sm text-sand-dim">No slots free for that duration on this date.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {slots?.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-slot={m}
                  onClick={() => setSelectedStartMinute(m)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs tabular-nums",
                    startMinute === m
                      ? "border-gold bg-gold text-petrol font-semibold"
                      : isHotSlot(m)
                        ? "border-danger/30 bg-danger/5 text-sand-dim"
                        : "border-petrol-lighter text-sand-dim hover:border-sand-dim"
                  )}
                >
                  {minutesToLabel(m)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <Label htmlFor="pet">Pet</Label>
        {pets.length === 0 ? (
          <div className="rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-2 text-sm text-sand-dim">
            No pets yet. <LinkButton href="/dashboard/owner/pets/new" size="sm" variant="secondary" className="ml-2">Add a pet</LinkButton>
          </div>
        ) : (
          <Select id="pet" value={petId} onChange={(e) => setPetId(e.target.value)}>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type === "DOG" ? "Dog" : "Cat"})
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-4">
        <Label htmlFor="note">Note for the caregiver (optional)</Label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full rounded-lg bg-petrol-light border border-petrol-lighter px-4 py-3 text-sand placeholder:text-sand-dim/60 outline-none transition-colors focus:border-gold"
          placeholder="Gate code, favorite treats, anything they should know…"
        />
      </div>

      <div className="mt-4">
        <Label>Payment</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("CASH")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              paymentMethod === "CASH"
                ? "border-gold bg-gold text-petrol font-medium"
                : "border-petrol-lighter text-sand-dim"
            )}
          >
            Cash on service
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CARD")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              paymentMethod === "CARD"
                ? "border-gold bg-gold text-petrol font-medium"
                : "border-petrol-lighter text-sand-dim"
            )}
          >
            Card
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm text-sand-dim">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="h-4 w-4 rounded border-petrol-lighter accent-[#e8a94b]"
          />
          Repeat weekly at this time
        </label>
        {repeat && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-sand-dim">for</span>
            <input
              type="number"
              min={1}
              max={8}
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(Number(e.target.value))}
              className="w-16 rounded-lg bg-petrol-light border border-petrol-lighter px-2 py-1 text-center text-sand"
            />
            <span className="text-sm text-sand-dim">weeks</span>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-lg border border-petrol-lighter bg-petrol-light px-4 py-3 text-sm">
        <div className="flex justify-between text-sand-dim">
          <span>{durationLabel(duration)} at {formatMoney(hourlyRate, currency)}/hr</span>
          <span>{formatMoney(price.subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sand-dim">
          <span>Service fee</span>
          <span>{formatMoney(price.serviceFee, currency)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-petrol-lighter pt-1 font-semibold text-sand">
          <span>Total{repeat ? ` × ${repeatWeeks}` : ""}</span>
          <span>{formatMoney(price.total, currency)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <Button
        className="mt-4 w-full"
        disabled={submitting || !selectedDate || startMinute === null || !petId}
        onClick={submit}
      >
        {submitting ? "Requesting…" : `Request booking · ${formatMoney(price.total, currency)}`}
      </Button>
    </Card>
  );
}
