import { NextResponse } from "next/server";
import { hasAnyAvailability } from "@/lib/availability";
import { nextNDays, toDateKey } from "@/lib/time";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const days = nextNDays(14);

  const availability = await Promise.all(days.map((d) => hasAnyAvailability(id, d)));

  return NextResponse.json({
    days: days.map((d, i) => ({ date: toDateKey(d), available: availability[i] })),
  });
}
