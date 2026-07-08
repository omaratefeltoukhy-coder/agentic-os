import { NextResponse } from "next/server";
import { searchCaregivers } from "@/lib/marketplace";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const caregivers = await searchCaregivers({
    city: searchParams.get("city") ?? undefined,
    service: searchParams.get("service") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
    language: searchParams.get("language") ?? undefined,
    verifiedOnly: searchParams.get("verified") === "1",
    date: searchParams.get("date") ?? undefined,
    area: searchParams.get("area") ?? undefined,
  });

  return NextResponse.json({ caregivers });
}
