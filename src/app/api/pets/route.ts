import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { petSchema } from "@/lib/validations/pet";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const pet = await prisma.pet.create({
    data: {
      ownerId: session.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      breed: parsed.data.breed || null,
      age: parsed.data.age ?? null,
      temperament: parsed.data.temperament || null,
      photoUrl: parsed.data.photoUrl || null,
      vaccinationCardUrl: parsed.data.vaccinationCardUrl || null,
    },
  });

  return NextResponse.json({ pet });
}
