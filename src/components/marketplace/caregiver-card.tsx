import Image from "next/image";
import Link from "next/link";
import type { CaregiverCardData } from "@/lib/marketplace";
import { CITY_INFO, SERVICE_LABELS, LANGUAGE_LABELS, formatMoney, type CurrencyCode } from "@/lib/constants/gulf";

export function CaregiverCard({ caregiver }: { caregiver: CaregiverCardData }) {
  return (
    <Link
      href={`/caregivers/${caregiver.id}`}
      className="block rounded-2xl border border-petrol-lighter bg-petrol-light/60 p-4 shadow-lg shadow-black/20 transition-colors hover:border-gold/50"
    >
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-petrol-lighter">
          {caregiver.image && (
            <Image
              src={caregiver.image}
              alt={caregiver.name ?? ""}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-display font-semibold text-sand">{caregiver.name}</span>
            {caregiver.verified && (
              <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                ✓ Verified
              </span>
            )}
            {caregiver.isPro && (
              <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                Pro
              </span>
            )}
            {caregiver.ratingCount === 0 && (
              <span className="rounded-full bg-petrol-lighter px-1.5 py-0.5 text-[10px] font-medium text-sand-dim">
                NEW
              </span>
            )}
          </div>
          <div className="mt-0.5 text-sm text-sand-dim">
            {caregiver.ratingCount > 0 ? (
              <span>
                ★ {caregiver.ratingAverage?.toFixed(1)} ({caregiver.ratingCount})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            {" · "}
            {CITY_INFO[caregiver.city as keyof typeof CITY_INFO]?.label}
          </div>
          <div className="mt-1 truncate text-xs text-sand-dim">
            {caregiver.areas.slice(0, 3).join(", ")}
          </div>
        </div>
      </div>

      {caregiver.bio && <p className="mt-3 line-clamp-2 text-sm text-sand-dim">{caregiver.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {caregiver.services.map((s) => (
          <span key={s} className="rounded-full bg-petrol-lighter px-2 py-0.5 text-[11px] text-sand-dim">
            {SERVICE_LABELS[s as keyof typeof SERVICE_LABELS]}
          </span>
        ))}
        {caregiver.languages.slice(0, 3).map((l) => (
          <span key={l} className="rounded-full bg-petrol-lighter px-2 py-0.5 text-[11px] text-sand-dim">
            {LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS]}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-display font-semibold text-gold">
          {formatMoney(caregiver.hourlyRate, caregiver.currency as CurrencyCode)}/hr
        </span>
        <span className="text-sm text-gold">View profile →</span>
      </div>
    </Link>
  );
}
