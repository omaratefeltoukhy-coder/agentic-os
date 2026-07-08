import { NextResponse } from "next/server";
import { getAvailableStartTimes } from "@/lib/availability";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const duration = Number(searchParams.get("duration") ?? "30");

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const dateObj = new Date(`${date}T00:00:00.000Z`);
  const slots = await getAvailableStartTimes(id, dateObj, duration);

  return NextResponse.json({ slots });
}
